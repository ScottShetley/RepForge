import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExerciseDisplay from './ExerciseDisplay';
import SubSetWorkout from './SubSetWorkout';
import ExerciseSwapModal from './ExerciseSwapModal';
import PlateCalculatorModal from './PlateCalculatorModal';
import { useAuth } from '../../hooks/useAuth';
import {
  saveWorkout,
  getUserProgress,
  updateUserProgressAfterWorkout,
  getLastWorkout,
  getUserSettings,
} from '../../services/firebase';
import { produce } from 'immer';

const workoutTemplates = {
  workoutA: {
    id: 'workoutA',
    name: 'Workout A',
    coreLifts: [
      // --- MODIFICATION: Added 'name' property to all core lifts ---
      { exerciseId: 'squat', name: 'Squat', sets: 5, reps: 5, category: 'Squat' },
      { exerciseId: 'bench-press', name: 'Bench Press', sets: 5, reps: 5, category: 'Bench Press' },
      { exerciseId: 'seated-cable-row', name: 'Seated Cable Row', sets: 5, reps: 5, category: 'Rows' },
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
      { exerciseId: 'squat', name: 'Squat', sets: 5, reps: 5, category: 'Squat' },
      { exerciseId: 'overhead-press', name: 'Overhead Press', sets: 5, reps: 5, category: 'Overhead Press' },
      { exerciseId: 'deadlift', name: 'Deadlift', sets: 1, reps: 5, category: 'Deadlift' },
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
const DELOAD_THRESHOLD = 3;
const DELOAD_PERCENTAGE = 0.9;

const WorkoutView = () => {
  const { currentUser } = useAuth();
  const [currentWorkoutId, setCurrentWorkoutId] = useState(null); 
  const [liftProgress, setLiftProgress] = useState(null);
  const [workoutState, setWorkoutState] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [userSettings, setUserSettings] = useState(null);

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorWeight, setCalculatorWeight] = useState(0);

  const [isSessionComplete, setIsSessionComplete] = useState(false);

  useEffect(() => {
    if (currentUser && !liftProgress) {
      const fetchData = async () => {
        const settings = await getUserSettings(currentUser.uid);
        setUserSettings(settings);

        const lastWorkout = await getLastWorkout(currentUser.uid);
        const nextWorkoutId =
          !lastWorkout || lastWorkout.id === 'workoutB'
            ? 'workoutA'
            : 'workoutB';
        
        setCurrentWorkoutId(nextWorkoutId);

        const progress = await getUserProgress(currentUser.uid);
        setLiftProgress(progress);
      };
      fetchData();
    }
  }, [currentUser, liftProgress]);

  useEffect(() => {
    if (currentWorkoutId && liftProgress) {
      const template = workoutTemplates[currentWorkoutId];

      const hydratedExercises = template.coreLifts.map((lift) => {
        const progress = liftProgress[lift.exerciseId];
        
        if (!progress) {
          console.warn(`No progress data found for exerciseId: ${lift.exerciseId}. This may be a new or swapped exercise.`);
          return {
            ...lift,
            progressId: lift.exerciseId,
            // --- FIX: Use the name from the template, not the category ---
            name: lift.name, 
            weight: 45,
            increment: 5,
            completedSets: Array(lift.sets).fill(false),
          };
        }
        return {
          ...lift,
          progressId: progress.id,
          name: progress.name,
          weight: progress.currentWeight,
          increment: progress.increment,
          completedSets: Array(lift.sets).fill(false),
        };
      });

      const accessoryExercises = template.subSetWorkout.map((ex) => ({
        ...ex,
        weight: '',
        completedSets: Array(Number(ex.sets) || 3).fill(false),
      }));

      setWorkoutState({
        id: template.id,
        name: template.name,
        exercises: hydratedExercises,
        subSetWorkout: accessoryExercises,
      });
    }
  }, [currentWorkoutId, liftProgress]);

  const handleOpenCalculator = (weight) => {
    setCalculatorWeight(weight);
    setIsCalculatorOpen(true);
  };

  const handleCloseCalculator = () => {
    setIsCalculatorOpen(false);
  };
  
  const handleSetToggle = (exerciseType, exerciseIndex, setIndex) => {
    setWorkoutState(
      produce(draft => {
        draft[exerciseType][exerciseIndex].completedSets[setIndex] = !draft[exerciseType][exerciseIndex].completedSets[setIndex];
      })
    );
  };
  
  const handleWeightAdjust = (exerciseIndex, weightToAdd) => {
    setWorkoutState(
      produce(draft => {
        const currentWeight = draft.exercises[exerciseIndex].weight;
        draft.exercises[exerciseIndex].weight = currentWeight + weightToAdd;
      })
    );
  };

  const handleAccessoryWeightChange = (exerciseIndex, newWeight) => {
    setWorkoutState(
      produce(draft => {
        draft.subSetWorkout[exerciseIndex].weight = newWeight;
      })
    );
  };

  const handleIncrementAccessoryWeight = (exerciseIndex) => {
    setWorkoutState(
      produce(draft => {
        const currentWeight = parseFloat(draft.subSetWorkout[exerciseIndex].weight) || 0;
        draft.subSetWorkout[exerciseIndex].weight = currentWeight + WEIGHT_INCREMENT_STEP;
      })
    );
  };

  const handleDecrementAccessoryWeight = (exerciseIndex) => {
    setWorkoutState(
      produce(draft => {
        const currentWeight = parseFloat(draft.subSetWorkout[exerciseIndex].weight) || 0;
        const newWeight = currentWeight - WEIGHT_INCREMENT_STEP;
        draft.subSetWorkout[exerciseIndex].weight = newWeight > 0 ? newWeight : 0;
      })
    );
  };

  const handleOpenSwapModal = (exerciseIndex) => {
    const exercise = workoutState.exercises[exerciseIndex];
    setExerciseToSwap({
      index: exerciseIndex,
      name: exercise.name,
      category: exercise.category,
    });
    setIsSwapModalOpen(true);
  };

  const handleCloseSwapModal = () => {
    setIsSwapModalOpen(false);
    setExerciseToSwap(null);
  };

  const handleExerciseSelect = (newExercise) => {
    setWorkoutState(produce(draft => {
      const swappedInExercise = {
        exerciseId: newExercise.id,
        name: newExercise.name,
        sets: 5, 
        reps: 5,
        category: newExercise.category,
        weight: '',
        completedSets: Array(5).fill(false),
      };
      draft.exercises[exerciseToSwap.index] = swappedInExercise;
    }));
    handleCloseSwapModal();
  };


  const handleSaveWorkout = async () => {
    if (!currentUser) {
      setSaveMessage('You must be logged in to save a workout.');
      return;
    }
    setIsSaving(true);
    setSaveMessage('');

    try {
      await saveWorkout(currentUser.uid, workoutState);
      
      const progressionPromises = [];
      const newLiftProgressState = { ...liftProgress };

      workoutState.exercises.forEach(exercise => {
        const progressData = liftProgress[exercise.exerciseId]; 
        if (!progressData) return;

        const wasSuccessful = exercise.completedSets.every(set => set === true);
        
        if (wasSuccessful) {
          const newWeight = progressData.currentWeight + progressData.increment;
          const updatePayload = { currentWeight: newWeight };
          if (progressData.failureCount > 0) {
            updatePayload.failureCount = 0;
          }
          progressionPromises.push(updateUserProgressAfterWorkout(progressData.id, updatePayload));
          newLiftProgressState[exercise.exerciseId] = { ...newLiftProgressState[exercise.exerciseId], currentWeight: newWeight, failureCount: 0 };
        } else {
          const currentFailures = progressData.failureCount || 0;
          const newFailureCount = currentFailures + 1;

          if (newFailureCount >= DELOAD_THRESHOLD) {
            const deloadWeight = Math.round((progressData.currentWeight * DELOAD_PERCENTAGE) / 5) * 5;
            const updatePayload = { currentWeight: deloadWeight, failureCount: 0 };
            progressionPromises.push(updateUserProgressAfterWorkout(progressData.id, updatePayload));
            newLiftProgressState[exercise.exerciseId] = { ...newLiftProgressState[exercise.exerciseId], currentWeight: deloadWeight, failureCount: 0 };
          } else {
            const updatePayload = { failureCount: newFailureCount };
            progressionPromises.push(updateUserProgressAfterWorkout(progressData.id, updatePayload));
            newLiftProgressState[exercise.exerciseId] = { ...newLiftProgressState[exercise.exerciseId], failureCount: newFailureCount };
          }
        }
      });
      
      await Promise.all(progressionPromises);
      setLiftProgress(newLiftProgressState);

      setIsSessionComplete(true);
      setSaveMessage('Workout Saved! Your next workout will be waiting for you when you return.');

    } catch (error) {
      setSaveMessage('Error: Could not save workout or apply progression.');
      console.error('Error during save/progression:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonClass = (id) => {
    return currentWorkoutId === id
      ? 'bg-cyan-500 text-white'
      : 'bg-gray-600 text-gray-300 hover:bg-gray-500';
  };

  if (!workoutState || !userSettings) {
    return (
      <div className="p-6 text-white text-center">Loading workout data...</div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setCurrentWorkoutId('workoutA')}
            disabled={isSessionComplete}
            className={`w-full rounded-lg px-6 py-2 font-bold transition-colors duration-200 md:w-auto ${getButtonClass('workoutA')} disabled:bg-gray-500 disabled:cursor-not-allowed`}
          >
            Workout A
          </button>
          <button
            onClick={() => setCurrentWorkoutId('workoutB')}
            disabled={isSessionComplete}
            className={`w-full rounded-lg px-6 py-2 font-bold transition-colors duration-200 md:w-auto ${getButtonClass('workoutB')} disabled:bg-gray-500 disabled:cursor-not-allowed`}
          >
            Workout B
          </button>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">{workoutState.name}</h2>
          <span className="text-lg text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="space-y-6">
          {workoutState.exercises.map((exercise, index) => (
            <ExerciseDisplay
              key={exercise.progressId || exercise.exerciseId}
              exercise={exercise}
              onSetToggle={(setIndex) => handleSetToggle('exercises', index, setIndex)}
              onSwap={() => handleOpenSwapModal(index)}
              isComplete={isSessionComplete}
              onWeightAdjust={(weightToAdd) => handleWeightAdjust(index, weightToAdd)}
              onCalculatorOpen={handleOpenCalculator}
            />
          ))}
        </div>
        
        <SubSetWorkout
          exercises={workoutState.subSetWorkout}
          onSetToggle={(exerciseIndex, setIndex) => handleSetToggle('subSetWorkout', exerciseIndex, setIndex)}
          onWeightChange={handleAccessoryWeightChange}
          onIncrement={handleIncrementAccessoryWeight}
          onDecrement={handleDecrementAccessoryWeight}
          isComplete={isSessionComplete}
        />

        <div className="mt-8 border-t border-gray-700 pt-6 text-center">
          {!isSessionComplete ? (
            <button
              onClick={handleSaveWorkout}
              disabled={isSaving}
              className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400 md:w-auto"
            >
              {isSaving ? 'Saving...' : 'Finish & Save Workout'}
            </button>
          ) : (
            <Link to="/" className="w-full rounded-lg bg-green-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-green-700 md:w-auto">
              Go to Dashboard
            </Link>
          )}

          {saveMessage && (
            <p className="mt-4 text-sm text-gray-300">{saveMessage}</p>
          )}
        </div>
      </div>
      
      <ExerciseSwapModal
        isOpen={isSwapModalOpen}
        onClose={handleCloseSwapModal}
        onExerciseSelect={handleExerciseSelect}
        exerciseToSwap={exerciseToSwap}
      />

      <PlateCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={handleCloseCalculator}
        targetWeight={calculatorWeight}
        barbellWeight={userSettings.barbellWeight}
      />
    </>
  );
};

export default WorkoutView;