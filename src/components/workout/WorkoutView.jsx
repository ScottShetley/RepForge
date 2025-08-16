import React, {useState, useEffect} from 'react';
import ExerciseDisplay from './ExerciseDisplay';
import SubSetWorkout from './SubSetWorkout'; // REVERTED IMPORT
import {useAuth} from '../../context/AuthContext';
import {saveWorkout} from '../../services/firebase';
import {produce} from 'immer';

const workoutTemplates = {
  workoutA: {
    id: 'workout01',
    name: 'Workout A',
    exercises: [
      {id: 'ex01', name: 'Squat', weight: 200, sets: 5, reps: 5},
      {id: 'ex02', name: 'Bench Press', weight: 150, sets: 5, reps: 5},
      {id: 'ex03', name: 'Barbell Row', weight: 135, sets: 5, reps: 5},
    ],
    // RENAMED KEY and EXPANDED LIST
    subSetWorkout: [
      {id: 'acc01', name: 'Dips', sets: 3, reps: '8-12'},
      {id: 'acc02', name: 'Tricep Pushdowns', sets: 3, reps: '10-15'},
      {id: 'acc03', name: 'Barbell Curls', sets: 3, reps: '8-12'},
      {id: 'acc04', name: 'Hanging Knee Raises', sets: 3, reps: 'To Failure'},
    ],
  },
  workoutB: {
    id: 'workout02',
    name: 'Workout B',
    exercises: [
      {id: 'ex04', name: 'Squat', weight: 205, sets: 5, reps: 5},
      {id: 'ex05', name: 'Overhead Press', weight: 100, sets: 5, reps: 5},
      {id: 'ex06', name: 'Deadlift', weight: 250, sets: 1, reps: 5},
    ],
    // RENAMED KEY and EXPANDED LIST
    subSetWorkout: [
      {id: 'acc05', name: 'Pull-ups / Chin-ups', sets: 3, reps: 'To Failure'},
      {id: 'acc06', name: 'Leg Press', sets: 3, reps: '10-15'},
      {id: 'acc07', name: 'Face Pulls', sets: 3, reps: '15-20'},
      {id: 'acc08', name: 'Lateral Raises', sets: 3, reps: '10-15'},
    ],
  },
};

const WorkoutView = () => {
  const [currentWorkoutId, setCurrentWorkoutId] = useState ('workoutA');
  const [workoutState, setWorkoutState] = useState (null);
  const [isSaving, setIsSaving] = useState (false);
  const [saveMessage, setSaveMessage] = useState ('');
  const {currentUser} = useAuth ();

  useEffect (
    () => {
      const template = workoutTemplates[currentWorkoutId];
      const initialState = {
        ...template,
        exercises: template.exercises.map (ex => ({
          ...ex,
          completedSets: Array (ex.sets).fill (false),
        })),
        // UPDATED KEY
        subSetWorkout: template.subSetWorkout.map (ex => ({
          ...ex,
          completedSets: Array (Number (ex.sets)).fill (false),
        })),
      };
      setWorkoutState (initialState);
    },
    [currentWorkoutId]
  );

  const handleSetToggle = (exerciseType, exerciseIndex, setIndex) => {
    setWorkoutState (
      produce (draft => {
        const exercise = draft[exerciseType][exerciseIndex];
        exercise.completedSets[setIndex] = !exercise.completedSets[setIndex];
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
      setSaveMessage ('Workout saved successfully!');
    } catch (error) {
      setSaveMessage ('Error: Could not save workout.');
      console.error ('Error saving workout:', error);
    } finally {
      setIsSaving (false);
      setTimeout (() => setSaveMessage (''), 3000);
    }
  };

  const getButtonClass = workoutId => {
    return currentWorkoutId === workoutId
      ? 'bg-cyan-500 text-white'
      : 'bg-gray-600 text-gray-300 hover:bg-gray-500';
  };

  if (!workoutState) {
    return <div>Loading workout...</div>;
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
        <span className="text-lg text-gray-400">August 16, 2025</span>
      </div>

      <div className="space-y-6">
        {workoutState.exercises.map ((exercise, index) => (
          <ExerciseDisplay
            key={exercise.id}
            exercise={exercise}
            onSetToggle={setIndex =>
              handleSetToggle ('exercises', index, setIndex)}
          />
        ))}
      </div>

      {/* UPDATED COMPONENT CALL AND PROPS */}
      <SubSetWorkout
        exercises={workoutState.subSetWorkout}
        onSetToggle={(exerciseIndex, setIndex) =>
          handleSetToggle ('subSetWorkout', exerciseIndex, setIndex)}
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
