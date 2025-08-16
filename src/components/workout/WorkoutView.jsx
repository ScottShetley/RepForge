import React, {useState, useEffect} from 'react';
import ExerciseDisplay from './ExerciseDisplay';
import SubSetWorkout from './SubSetWorkout';
import {useAuth} from '../../context/AuthContext';
import {
  saveWorkout,
  getUserProgress,
  updateUserProgress,
  getLastWorkout, // Import the new function
} from '../../services/firebase';
import {produce} from 'immer';

const workoutTemplates = {
  workoutA: {
    id: 'workoutA',
    name: 'Workout A',
    coreLifts: [
      {exerciseId: 'squat', sets: 5, reps: 5},
      {exerciseId: 'bench-press', sets: 5, reps: 5},
      {exerciseId: 'barbell-row', sets: 5, reps: 5},
    ],
    subSetWorkout: [
      {id: 'acc01', name: 'Dips', sets: 3, reps: '8-12'},
      {id: 'acc02', name: 'Tricep Pushdowns', sets: 3, reps: '10-15'},
      {id: 'acc03', name: 'Barbell Curls', sets: 3, reps: '8-12'},
      {id: 'acc04', name: 'Hanging Knee Raises', sets: 3, reps: 'To Failure'},
    ],
  },
  workoutB: {
    id: 'workoutB',
    name: 'Workout B',
    coreLifts: [
      {exerciseId: 'squat', sets: 5, reps: 5},
      {exerciseId: 'overhead-press', sets: 5, reps: 5},
      {exerciseId: 'deadlift', sets: 1, reps: 5},
    ],
    subSetWorkout: [
      {id: 'acc05', name: 'Pull-ups / Chin-ups', sets: 3, reps: 'To Failure'},
      {id: 'acc06', name: 'Leg Press', sets: 3, reps: '10-15'},
      {id: 'acc07', name: 'Face Pulls', sets: 3, reps: '15-20'},
      {id: 'acc08', name: 'Lateral Raises', sets: 3, reps: '10-15'},
    ],
  },
};

const WEIGHT_INCREMENT_STEP = 5;

const WorkoutView = () => {
  // NEW: Default to null to wait for logic to run
  const [currentWorkoutId, setCurrentWorkoutId] = useState (null);
  const [liftProgress, setLiftProgress] = useState (null);
  const [workoutState, setWorkoutState] = useState (null);
  const [isSaving, setIsSaving] = useState (false);
  const [saveMessage, setSaveMessage] = useState ('');
  const {currentUser} = useAuth ();

  // This effect now handles initial data loading and workout suggestion
  useEffect (
    () => {
      if (currentUser && !liftProgress) {
        // Only run once on load
        const fetchData = async () => {
          // 1. Determine the next workout
          const lastWorkout = await getLastWorkout (currentUser.uid);
          const nextWorkoutId = !lastWorkout || lastWorkout.id === 'workoutB'
            ? 'workoutA'
            : 'workoutB';

          setCurrentWorkoutId (nextWorkoutId);

          // 2. Fetch the user's lift progression
          const progress = await getUserProgress (currentUser.uid);
          setLiftProgress (progress);
        };
        fetchData ();
      }
    },
    [currentUser, liftProgress]
  );

  // This effect builds the workout state when the ID or progress changes
  useEffect (
    () => {
      if (currentWorkoutId && liftProgress) {
        const template = workoutTemplates[currentWorkoutId];

        const hydratedExercises = template.coreLifts.map (lift => {
          const progress = liftProgress[lift.exerciseId];
          return {
            ...lift,
            progressId: progress.id,
            name: progress.name,
            weight: progress.currentWeight,
            increment: progress.increment,
            completedSets: Array (lift.sets).fill (false),
          };
        });

        const accessoryExercises = template.subSetWorkout.map (ex => ({
          ...ex,
          weight: '',
          completedSets: Array (Number (ex.sets) || 3).fill (false),
        }));

        setWorkoutState ({
          id: template.id,
          name: template.name,
          exercises: hydratedExercises,
          subSetWorkout: accessoryExercises,
        });
      }
    },
    [currentWorkoutId, liftProgress]
  );

  const handleSetToggle = (exerciseType, exerciseIndex, setIndex) => {
    setWorkoutState (
      produce (draft => {
        draft[exerciseType][exerciseIndex].completedSets[setIndex] = !draft[
          exerciseType
        ][exerciseIndex].completedSets[setIndex];
      })
    );
  };

  const handleAccessoryWeightChange = (exerciseIndex, newWeight) => {
    setWorkoutState (
      produce (draft => {
        draft.subSetWorkout[exerciseIndex].weight = newWeight;
      })
    );
  };

  const handleIncrementAccessoryWeight = exerciseIndex => {
    setWorkoutState (
      produce (draft => {
        const currentWeight =
          parseFloat (draft.subSetWorkout[exerciseIndex].weight) || 0;
        draft.subSetWorkout[exerciseIndex].weight =
          currentWeight + WEIGHT_INCREMENT_STEP;
      })
    );
  };

  const handleDecrementAccessoryWeight = exerciseIndex => {
    setWorkoutState (
      produce (draft => {
        const currentWeight =
          parseFloat (draft.subSetWorkout[exerciseIndex].weight) || 0;
        const newWeight = currentWeight - WEIGHT_INCREMENT_STEP;
        draft.subSetWorkout[exerciseIndex].weight = newWeight > 0
          ? newWeight
          : 0;
      })
    );
  };

  const handleSaveWorkout = async () => {
    if (!currentUser) {
      setSaveMessage ('You must be logged in to save a workout.');
      return;
    }
    setIsSaving (true);
    setSaveMessage ('');

    try {
      await saveWorkout (currentUser.uid, workoutState);
      setSaveMessage ('Workout saved successfully! Applying progression...');

      const updates = [];
      workoutState.exercises.forEach (exercise => {
        const wasSuccessful = exercise.completedSets.every (
          set => set === true
        );
        if (wasSuccessful) {
          const newWeight = exercise.weight + exercise.increment;
          updates.push (updateUserProgress (exercise.progressId, newWeight));
        }
      });

      await Promise.all (updates);

      setLiftProgress (
        produce (draft => {
          workoutState.exercises.forEach (exercise => {
            const wasSuccessful = exercise.completedSets.every (
              set => set === true
            );
            if (wasSuccessful) {
              draft[exercise.exerciseId].currentWeight += exercise.increment;
            }
          });
        })
      );

      setSaveMessage ('Progression applied for your next session!');
    } catch (error) {
      setSaveMessage ('Error: Could not save workout or apply progression.');
      console.error ('Error during save/progression:', error);
    } finally {
      setIsSaving (false);
      setTimeout (() => setSaveMessage (''), 4000);
    }
  };

  const getButtonClass = workoutId => {
    return currentWorkoutId === workoutId
      ? 'bg-cyan-500 text-white'
      : 'bg-gray-600 text-gray-300 hover:bg-gray-500';
  };

  // NEW: Show a loading state until the initial workout is determined
  if (!workoutState) {
    return (
      <div className="p-6 text-white text-center">
        Determining next workout...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex justify-center space-x-4">
        <button
          onClick={() => setCurrentWorkoutId ('workoutA')}
          className={`w-full rounded-lg px-6 py-2 font-bold transition-colors duration-200 md:w-auto ${getButtonClass ('workoutA')}`}
        >
          Workout A
        </button>
        <button
          onClick={() => setCurrentWorkoutId ('workoutB')}
          className={`w-full rounded-lg px-6 py-2 font-bold transition-colors duration-200 md:w-auto ${getButtonClass ('workoutB')}`}
        >
          Workout B
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">{workoutState.name}</h2>
        <span className="text-lg text-gray-400">
          {new Date ().toLocaleDateString ('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      <div className="space-y-6">
        {workoutState.exercises.map ((exercise, index) => (
          <ExerciseDisplay
            key={exercise.progressId}
            exercise={exercise}
            onSetToggle={setIndex =>
              handleSetToggle ('exercises', index, setIndex)}
          />
        ))}
      </div>

      <SubSetWorkout
        exercises={workoutState.subSetWorkout}
        onSetToggle={(exerciseIndex, setIndex) =>
          handleSetToggle ('subSetWorkout', exerciseIndex, setIndex)}
        onWeightChange={handleAccessoryWeightChange}
        onIncrement={handleIncrementAccessoryWeight}
        onDecrement={handleDecrementAccessoryWeight}
      />

      <div className="mt-8 border-t border-gray-700 pt-6 text-center">
        <button
          onClick={handleSaveWorkout}
          disabled={isSaving}
          className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400 md:w-auto"
        >
          {isSaving ? 'Saving...' : 'Finish & Save Workout'}
        </button>
        {saveMessage &&
          <p className="mt-4 text-sm text-gray-300">{saveMessage}</p>}
      </div>
    </div>
  );
};

export default WorkoutView;
