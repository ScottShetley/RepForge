import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ExerciseDisplay from './ExerciseDisplay';
import SubSetWorkout from './SubSetWorkout';
import ExerciseSwapModal from './ExerciseSwapModal';
import PlateCalculatorModal from './PlateCalculatorModal';
import AdjustWeightModal from './AdjustWeightModal';
import RestTimer from './RestTimer';
import { useAuth } from '../../hooks/useAuth';
import {
  saveWorkoutSession,
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
      { id: 'acc01', name: 'Dips', sets: 3, reps: '8-12' },
      { id: 'acc02', name: 'Tricep Pushdowns', sets: 3, reps: '10-15' },
      { id: 'acc03', name: 'Barbell Curls', sets: 3, reps: '8-12' },
      { id: 'acc04', name: 'Hanging Knee Raises', sets: 3, reps: 'To Failure' },
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
      { id: 'acc05', name: 'Pull-ups / Chin-ups', sets: 3, reps: 'To Failure' },
      { id: 'acc06', name: 'Leg Press', sets: 3, reps: '10-15' },
      { id: 'acc07', name: 'Face Pulls', sets: 3, reps: '15-20' },
      { id: 'acc08', name: 'Lateral Raises', sets: 3, reps: '10-15' },
    ],
  },
};
const DELOAD_THRESHOLD = 3;


const WorkoutView = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [liftProgress, setLiftProgress] = useState(null);
  const [workoutState, setWorkoutState] = useState(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isWorkoutDirty, setIsWorkoutDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [userSettings, setUserSettings] = useState(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorWeight, setCalculatorWeight] = useState(0);
  const [isAdjustWeightModalOpen, setIsAdjustWeightModalOpen] = useState(false);
  const [exerciseToAdjust, setExerciseToAdjust] = useState(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const workoutStateRef = useRef(workoutState);
  useEffect(() => {
    workoutStateRef.current = workoutState;
  }, [workoutState]);

  useEffect(() => {
    try {
      const savedWorkoutJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedWorkoutJSON) {
        const savedWorkout = JSON.parse(savedWorkoutJSON);
        if (location.state?.workoutId && savedWorkout.id !== location.state.workoutId) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } else {
            setWorkoutState(savedWorkout);
            setIsDraftLoaded(true);
            setIsWorkoutDirty(true);
        }
      }
    } catch (error) {
      console.error("Failed to load workout from local storage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [location.state]);

  useEffect(() => {
    if (workoutState && isWorkoutDirty && !isSessionComplete && !isDiscarding) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workoutState));
    }
  }, [workoutState, isWorkoutDirty, isSessionComplete, isDiscarding]);

  useEffect(() => {
    if (!currentUser || isDraftLoaded || workoutState) {
        return;
    }
    const initializeWorkout = async () => {
        let workoutIdToLoad = location.state?.workoutId;
        if (!workoutIdToLoad) {
            const lastWorkout = await getLastWorkout(currentUser.uid);
            workoutIdToLoad = !lastWorkout || lastWorkout.id === 'workoutB' ? 'workoutA' : 'workoutB';
        }
        
        const settings = await getUserSettings(currentUser.uid);
        setUserSettings(settings);
        const progress = await getUserProgress(currentUser.uid);
        setLiftProgress(progress);
        
        const template = workoutTemplates[workoutIdToLoad];
        if (!template) {
            navigate('/select-workout');
            return;
        }

        const hydratedExercises = template.coreLifts.map((lift) => {
            const progressData = progress[lift.exerciseId];
            const newSets = Array.from({ length: lift.sets }, () => ({ reps: 0, targetReps: lift.reps }));
            return {
                ...lift,
                progressId: progressData?.id || lift.exerciseId,
                name: progressData?.name || lift.name,
                weight: progressData?.currentWeight || 45,
                increment: progressData?.increment || 5,
                sets: newSets,
                isLocked: false,
            };
        });

        const accessoryExercises = template.subSetWorkout.map((ex) => ({
            ...ex,
            weight: '',
            sets: Array.from({ length: Number(ex.sets) || 3 }, () => ({ reps: 0, targetReps: ex.reps })),
            isLocked: false,
        }));

        setWorkoutState({
            id: template.id,
            name: template.name,
            exercises: hydratedExercises,
            subSetWorkout: accessoryExercises,
        });
    };
    initializeWorkout();
  }, [currentUser, location.state, isDraftLoaded, workoutState, navigate]);

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
    if (exerciseType === 'exercises' && !isTimerRunning) {
      setIsTimerVisible(true);
    }
  };

  const handleStartTimer = () => {
    setIsTimerVisible(false);
    setIsTimerRunning(true);
  };

  const handleCloseTimer = () => {
    setIsTimerVisible(false);
    setIsTimerRunning(false);
  };
  
  const handleOpenCalculator = (weight) => {
    setCalculatorWeight(weight);
    setIsCalculatorOpen(true);
  };

  const handleCloseCalculator = () => {
    setIsCalculatorOpen(false);
  };
  
  const handleLockInExercise = (exerciseType, exerciseIndex) => {
    if (!isWorkoutDirty) setIsWorkoutDirty(true);
    setWorkoutState(
      produce(draft => {
        draft[exerciseType][exerciseIndex].isLocked = true;
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
        draft.subSetWorkout[exerciseIndex].weight = currentWeight + (userSettings?.weightIncrement || 5);
      })
    );
  };

  const handleDecrementAccessoryWeight = (exerciseIndex) => {
    if (!isWorkoutDirty) setIsWorkoutDirty(true);
    setWorkoutState(
      produce(draft => {
        const currentWeight = parseFloat(draft.subSetWorkout[exerciseIndex].weight) || 0;
        const newWeight = currentWeight - (userSettings?.weightIncrement || 5);
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

  const handleOpenAdjustWeightModal = (type, index) => {
    setExerciseToAdjust({ type, index });
    setIsAdjustWeightModalOpen(true);
  };

  const handleCloseAdjustWeightModal = () => {
    setIsAdjustWeightModalOpen(false);
    setExerciseToAdjust(null);
  };

  const handleUpdateWeight = (newWeight) => {
    if (exerciseToAdjust) {
      if (!isWorkoutDirty) setIsWorkoutDirty(true);
      setWorkoutState(
        produce(draft => {
          draft[exerciseToAdjust.type][exerciseToAdjust.index].weight = newWeight;
        })
      );
    }
  };

  const handleSaveWorkout = async () => {
    if (!currentUser || !userSettings) {
      setSaveMessage('You must be logged in and settings must be loaded.');
      return;
    }
    setIsSaving(true);
    setSaveMessage('');

    const finalWorkoutState = workoutStateRef.current;
    const progressionPromises = [];
    const { weightIncrement, deloadPercentage } = userSettings;
    const deloadMultiplier = 1 - deloadPercentage / 100;
    
    let newPRsAchieved = false;

    const exercisesWithStatus = finalWorkoutState.exercises.map(exercise => {
      const progressData = liftProgress[exercise.exerciseId];
      if (!progressData) return exercise;

      const totalRepsLogged = exercise.sets.reduce((sum, set) => sum + (set.reps || 0), 0);
      const wasSuccessful = exercise.sets.every(set => set.reps >= set.targetReps);

      let status = 'skipped';
      if (totalRepsLogged > 0) {
        status = wasSuccessful ? 'successful' : 'failed';
      }
      
      switch (status) {
        case 'successful': { // --- FIX: Added block scope
          if (exercise.weight > progressData.currentWeight) {
            newPRsAchieved = true;
          }
          const newWeight = progressData.currentWeight + weightIncrement;
          progressionPromises.push(
            updateUserProgressAfterWorkout(currentUser.uid, exercise.progressId, { currentWeight: newWeight, failureCount: 0 })
          );
          break;
        }
        case 'failed': { // --- FIX: Added block scope
          const newFailureCount = (progressData.failureCount || 0) + 1;
          if (newFailureCount >= DELOAD_THRESHOLD) {
            const deloadWeight = Math.round((progressData.currentWeight * deloadMultiplier) / 5) * 5;
            progressionPromises.push(
              updateUserProgressAfterWorkout(currentUser.uid, exercise.progressId, { currentWeight: deloadWeight, failureCount: 0 })
            );
          } else {
            progressionPromises.push(
              updateUserProgressAfterWorkout(currentUser.uid, exercise.progressId, { failureCount: newFailureCount })
            );
          }
          break;
        }
        case 'skipped':
          // Do nothing for progression
          break;
        default:
          break;
      }

      return { ...exercise, progressionStatus: status };
    });

    try {
      const workoutToSave = {
        ...finalWorkoutState,
        exercises: exercisesWithStatus,
        containsNewPR: newPRsAchieved,
        workoutType: '5x5',
      };

      await saveWorkoutSession(currentUser.uid, workoutToSave);
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
      setIsDraftLoaded(false);
      setIsWorkoutDirty(false);
      setIsSessionComplete(false);
      setSaveMessage('');
      navigate('/select-workout');
    }
  };

  if (!workoutState || !userSettings) {
    return <div className="p-6 text-center text-white">Loading workout...</div>;
  }

  return (
    <>
      <div className="p-4 pb-24 md:p-6">
        {isDraftLoaded && !isSessionComplete && (
          <div className="mb-4 rounded-lg bg-yellow-500/20 p-3 text-center text-sm font-bold text-yellow-300">
            Resuming in-progress workout.
          </div>
        )}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">{workoutState.name}</h2>
          <span className="text-lg text-gray-400">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
              onAdjustWeightOpen={() => handleOpenAdjustWeightModal('exercises', index)}
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
            <Link to="/" className="inline-block w-full rounded-lg bg-green-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-green-700 md:w-auto">
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
      <AdjustWeightModal
        isOpen={isAdjustWeightModalOpen}
        onClose={handleCloseAdjustWeightModal}
        onSubmit={handleUpdateWeight}
        currentWeight={
          exerciseToAdjust && workoutState
            ? workoutState[exerciseToAdjust.type][exerciseToAdjust.index].weight
            : 0
        }
      />
      <RestTimer 
        isVisible={isTimerVisible || isTimerRunning}
        onStart={handleStartTimer}
        onClose={handleCloseTimer}
      />
    </>
  );
};

export default WorkoutView;