import React, { useState, useEffect, useRef } from 'react';
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

const LOCAL_STORAGE_KEY = 'inProgressRepForgeWorkout';

const workoutTemplates = {
  workoutA: {
    id: 'workoutA',
    name: 'Workout A',
    coreLifts: [
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
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isWorkoutDirty, setIsWorkoutDirty] = useState(false);

  const workoutStateRef = useRef(workoutState);
  useEffect(() => {
    workoutStateRef.current = workoutState;
  }, [workoutState]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [userSettings, setUserSettings] = useState(null);

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorWeight, setCalculatorWeight] = useState(0);

  const [isSessionComplete, setIsSessionComplete] = useState(false);

  useEffect(() => {
    try {
      const savedWorkoutJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedWorkoutJSON) {
        const savedWorkout = JSON.parse(savedWorkoutJSON);
        setWorkoutState(savedWorkout);
        setIsDraftLoaded(true);
        setIsWorkoutDirty(true); 
        console.log("Loaded in-progress workout from local storage.");
      }
    } catch (error) {
      console.error("Failed to load workout from local storage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (workoutState && isWorkoutDirty && !isSessionComplete && !isDiscarding) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workoutState));
    }
  }, [workoutState, isWorkoutDirty, isSessionComplete, isDiscarding]);

  useEffect(() => {
    if (isDraftLoaded || (currentUser && liftProgress)) {
      return;
    }

    const fetchData = async () => {
      const settings = await getUserSettings(currentUser.uid);
      setUserSettings(settings);

      const lastWorkout = await getLastWorkout(currentUser.uid);
      const nextWorkoutId = !lastWorkout || lastWorkout.id === 'workoutB' ? 'workoutA' : 'workoutB';
      
      setCurrentWorkoutId(nextWorkoutId);

      const progress = await getUserProgress(currentUser.uid);
      setLiftProgress(progress);
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser, liftProgress, isDraftLoaded]);
  
  useEffect(() => {
    if (workoutState || !currentWorkoutId || !liftProgress) {
      return;
    }

    const template = workoutTemplates[currentWorkoutId];
    const hydratedExercises = template.coreLifts.map((lift) => {
      const progress = liftProgress[lift.exerciseId];
      const newSets = Array.from({ length: lift.sets }, () => ({
        reps: 0,
        targetReps: lift.reps,
      }));

      if (!progress) {
        return {
          ...lift,
          progressId: lift.exerciseId, name: lift.name, weight: 45, increment: 5,
          sets: newSets, isLocked: false,
        };
      }
      return {
        ...lift,
        progressId: progress.id, name: progress.name, weight: progress.currentWeight, increment: progress.increment,
        sets: newSets, isLocked: false,
      };
    });
    
    const accessoryExercises = template.subSetWorkout.map((ex) => ({
      ...ex, weight: '', 
      sets: Array.from({ length: Number(ex.sets) || 3 }, () => ({ reps: 0, targetReps: ex.reps })),
      isLocked: false,
    }));
    
    setWorkoutState({
      id: template.id, name: template.name, exercises: hydratedExercises, subSetWorkout: accessoryExercises,
    });
    
    if (isDiscarding) {
      setIsDiscarding(false);
    }
  }, [currentWorkoutId, liftProgress, workoutState, isDiscarding]);

  const handleOpenCalculator = (weight) => {
    setCalculatorWeight(weight);
    setIsCalculatorOpen(true);
  };

  const handleCloseCalculator = () => {
    setIsCalculatorOpen(false);
  };
  
  const handleSetToggle = (exerciseType, exerciseIndex, setIndex) => {
    if (!isWorkoutDirty) setIsWorkoutDirty(true);
    setWorkoutState(
      produce(draft => {
        const set = draft[exerciseType][exerciseIndex].sets[setIndex];
        if (set.reps < set.targetReps) {
          set.reps = set.targetReps;
        } else {
          set.reps = 0;
        }
      })
    );
  };
  
  const handleLockInExercise = (exerciseType, exerciseIndex) => {
    if (!isWorkoutDirty) setIsWorkoutDirty(true);
    setWorkoutState(
      produce(draft => {
        draft[exerciseType][exerciseIndex].isLocked = true;
      })
    );
  };
  
  const handleWeightAdjust = (exerciseIndex, weightToAdd) => {
    if (!isWorkoutDirty) setIsWorkoutDirty(true);
    setWorkoutState(
      produce(draft => {
        const currentWeight = draft.exercises[exerciseIndex].weight;
        draft.exercises[exerciseIndex].weight = currentWeight + weightToAdd;
      })
    );
  };

  const handleAccessoryWeightChange = (exerciseIndex, newWeight) => {
    if (!isWorkoutDirty) setIsWorkoutDirty(true);
    setWorkoutState(
      produce(draft => {
        draft.subSetWorkout[exerciseIndex].weight = newWeight;
      })
    );
  };

  const handleIncrementAccessoryWeight = (exerciseIndex) => {
    if (!isWorkoutDirty) setIsWorkoutDirty(true);
    setWorkoutState(
      produce(draft => {
        const currentWeight = parseFloat(draft.subSetWorkout[exerciseIndex].weight) || 0;
        draft.subSetWorkout[exerciseIndex].weight = currentWeight + WEIGHT_INCREMENT_STEP;
      })
    );
  };

  const handleDecrementAccessoryWeight = (exerciseIndex) => {
    if (!isWorkoutDirty) setIsWorkoutDirty(true);
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
      index: exerciseIndex, name: exercise.name, category: exercise.category,
    });
    setIsSwapModalOpen(true);
  };

  const handleCloseSwapModal = () => {
    setIsSwapModalOpen(false);
    setExerciseToSwap(null);
  };

  // --- FIX: Removed duplicate 'sets' key ---
  const handleExerciseSelect = (newExercise) => {
    if (!isWorkoutDirty) setIsWorkoutDirty(true);
    setWorkoutState(produce(draft => {
        const newSets = Array.from({ length: 5 }, () => ({ reps: 0, targetReps: 5 }));
        const swappedInExercise = {
            exerciseId: newExercise.id,
            name: newExercise.name,
            reps: 5,
            category: newExercise.category,
            weight: '',
            isLocked: false,
            sets: newSets,
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

    const finalWorkoutState = workoutStateRef.current;
    // --- DIAGNOSTIC LOG ---
    console.log("Saving workout data:", JSON.stringify(finalWorkoutState, null, 2));

    try {
      await saveWorkout(currentUser.uid, finalWorkoutState);
      
      const progressionPromises = [];
      finalWorkoutState.exercises.forEach(exercise => {
        const progressData = liftProgress[exercise.exerciseId]; 
        if (!progressData) return;
        
        const wasSuccessful = exercise.sets.every(set => set.reps >= set.targetReps);
        
        if (wasSuccessful) {
          const newWeight = progressData.currentWeight + progressData.increment;
          const updatePayload = { currentWeight: newWeight, failureCount: 0 };
          progressionPromises.push(updateUserProgressAfterWorkout(currentUser.uid, exercise.progressId, updatePayload));
        } else {
          const newFailureCount = (progressData.failureCount || 0) + 1;
          if (newFailureCount >= DELOAD_THRESHOLD) {
            const deloadWeight = Math.round((progressData.currentWeight * DELOAD_PERCENTAGE) / 5) * 5;
            progressionPromises.push(updateUserProgressAfterWorkout(currentUser.uid, exercise.progressId, { currentWeight: deloadWeight, failureCount: 0 }));
          } else {
            progressionPromises.push(updateUserProgressAfterWorkout(currentUser.uid, exercise.progressId, { failureCount: newFailureCount }));
          }
        }
      });
      
      await Promise.all(progressionPromises);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setLiftProgress(null);
      setIsSessionComplete(true);
      setSaveMessage('Workout Saved! Your next workout will be waiting for you when you return.');

    } catch (error) {
      setSaveMessage('Error: Could not save workout or apply progression.');
      console.error('Error during save/progression:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDiscardWorkout = () => {
    if (window.confirm("Are you sure you want to discard your in-progress workout and start a new one?")) {
      setIsDiscarding(true);
      
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      setWorkoutState(null);
      setLiftProgress(null);
      setIsDraftLoaded(false);
      setIsWorkoutDirty(false);
      setIsSessionComplete(false);
      setSaveMessage('');
    }
  };

  const getButtonClass = (id) => {
    return currentWorkoutId === id ? 'bg-cyan-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500';
  };

  if (!workoutState || !userSettings) {
    if (isDraftLoaded && !userSettings) {
      if(currentUser && !userSettings) {
        getUserSettings(currentUser.uid).then(setUserSettings);
      }
      return <div className="p-6 text-white text-center">Loading user settings...</div>;
    }
    return <div className="p-6 text-white text-center">Loading workout data...</div>;
  }

  return (
    <>
      <div className="p-4 md:p-6">
        {isDraftLoaded && !isSessionComplete && (
          <div className="mb-4 rounded-lg bg-yellow-500/20 p-3 text-center text-sm font-bold text-yellow-300">
            Resuming in-progress workout.
          </div>
        )}

        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setCurrentWorkoutId('workoutA')}
            disabled={isSessionComplete || isDraftLoaded}
            className={`w-full rounded-lg px-6 py-2 font-bold transition-colors duration-200 md:w-auto ${getButtonClass('workoutA')} disabled:bg-gray-500 disabled:cursor-not-allowed`}
          >
            Workout A
          </button>
          <button
            onClick={() => setCurrentWorkoutId('workoutB')}
            disabled={isSessionComplete || isDraftLoaded}
            className={`w-full rounded-lg px-6 py-2 font-bold transition-colors duration-200 md:w-auto ${getButtonClass('workoutB')} disabled:bg-gray-500 disabled:cursor-not-allowed`}
          >
            Workout B
          </button>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">{workoutState.name}</h2>
          <span className="text-lg text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
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
              onLockIn={() => handleLockInExercise('exercises', index)}
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
          onLockIn={(exerciseIndex) => handleLockInExercise('subSetWorkout', exerciseIndex)}
        />

        <div className="mt-8 border-t border-gray-700 pt-6 text-center">
          {!isSessionComplete ? (
            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
              {isDraftLoaded && (
                <button
                  onClick={handleDiscardWorkout}
                  className="w-full rounded-lg bg-gray-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-gray-500 md:w-auto"
                >
                  Discard & Start New
                </button>
              )}
              <button
                onClick={handleSaveWorkout}
                disabled={isSaving}
                className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400 md:w-auto"
              >
                {isSaving ? 'Saving...' : 'Finish & Save Workout'}
              </button>
            </div>
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
        barbellWeight={userSettings?.barbellWeight}
      />
    </>
  );
};

export default WorkoutView;