import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ExerciseDisplay from './ExerciseDisplay';
import SubSetWorkout from './SubSetWorkout';
import ExerciseSwapModal from './ExerciseSwapModal';
import PlateCalculatorModal from './PlateCalculatorModal';
import AdjustWeightModal from './AdjustWeightModal';
import { useAuth } from '../../hooks/useAuth';
import {
  saveWorkoutSession,
  getUserProgress,
  updateUserProgressAfterWorkout,
  getUserSettings,
} from '../../services/firebase';
import { produce } from 'immer';

const LOCAL_STORAGE_KEY = 'inProgressRepForgeWorkout';

const workoutTemplates = {
  workoutA: {
    id: 'workoutA',
    name: 'Workout A',
    coreLifts: [
      { exerciseId: 'squat', name: 'Squat', sets: 5, reps: 5, category: 'Squat', increment: 5 },
      { exerciseId: 'bench-press', name: 'Bench Press', sets: 5, reps: 5, category: 'Bench Press', increment: 5 },
      { exerciseId: 'seated-cable-row', name: 'Seated Cable Row', sets: 5, reps: 5, category: 'Rows', increment: 5 },
    ],
    subSetWorkout: [
      { id: 'acc01', name: 'Dips', sets: 3, reps: '8-12', weight: 0 },
      { id: 'acc02', name: 'Tricep Pushdowns', sets: 3, reps: '8-12', weight: 50 },
    ],
  },
  workoutB: {
    id: 'workoutB',
    name: 'Workout B',
    coreLifts: [
      { exerciseId: 'squat', name: 'Squat', sets: 5, reps: 5, category: 'Squat', increment: 5 },
      { exerciseId: 'overhead-press', name: 'Overhead Press', sets: 5, reps: 5, category: 'Overhead Press', increment: 5 },
      { exerciseId: 'deadlift', name: 'Deadlift', sets: 1, reps: 5, category: 'Deadlift', increment: 10 },
    ],
    subSetWorkout: [
      { id: 'acc03', name: 'Pull-ups', sets: 3, reps: 'As many as possible', weight: 0 },
      { id: 'acc04', name: 'Bicep Curls', sets: 3, reps: '8-12', weight: 30 },
    ],
  },
};

const WorkoutView = ({ workoutId }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [workoutState, setWorkoutState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorWeight, setCalculatorWeight] = useState(0);
  const [isAdjustWeightModalOpen, setIsAdjustWeightModalOpen] = useState(false);
  const [exerciseToAdjust, setExerciseToAdjust] = useState(null);
  const [userSettings, setUserSettings] = useState({ barbellWeight: 45 });
  const workoutIdRef = useRef(workoutId);

  useEffect(() => {
    let timer;
    if (!loading && workoutState && !isSaving) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, workoutState, isSaving]);

  useEffect(() => {
    const initializeWorkout = async () => {
      if (!currentUser || !workoutId) {
        setLoading(false);
        return;
      }
      
      try {
        const settings = await getUserSettings(currentUser.uid);
        if (settings) setUserSettings(settings);

        const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSession) {
          const { workoutId: savedWorkoutId, state } = JSON.parse(savedSession);
          if (savedWorkoutId === workoutId) {
            setWorkoutState(state);
            setLoading(false);
            return;
          }
        }

        const template = workoutTemplates[workoutId];
        const progress = await getUserProgress(currentUser.uid);

        const initialCoreLifts = template.coreLifts.map(lift => {
          const liftProgress = progress[lift.exerciseId] || { currentWeight: 45, failureCount: 0 };
          return {
            ...lift,
            weight: liftProgress.currentWeight,
            failureCount: liftProgress.failureCount,
            sets: Array(lift.sets).fill({ reps: null, completed: false }),
            progressionStatus: 'pending',
            isLocked: false,
          };
        });

        const initialSubSetWorkout = template.subSetWorkout.map(ex => ({
          ...ex,
          sets: Array(ex.sets).fill({ completed: false }),
          isLocked: false,
        }));

        const initialState = { coreLifts: initialCoreLifts, subSetWorkout: initialSubSetWorkout };
        setWorkoutState(initialState);
      } catch (err) {
        console.error("Failed to initialize workout:", err);
        setError('There was an issue setting up your workout.');
      } finally {
        setLoading(false);
      }
    };

    initializeWorkout();
  }, [currentUser, workoutId]);

  useEffect(() => {
    if (workoutState) {
      const sessionToSave = { workoutId: workoutIdRef.current, state: workoutState };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionToSave));
    }
  }, [workoutState]);

  const handleSetToggle = (exerciseIndex, setIndex) => {
    setWorkoutState(produce(draft => {
      const isCompleted = draft.coreLifts[exerciseIndex].sets[setIndex].completed;
      draft.coreLifts[exerciseIndex].sets[setIndex].completed = !isCompleted;
      draft.coreLifts[exerciseIndex].sets[setIndex].reps = !isCompleted ? draft.coreLifts[exerciseIndex].reps : null;
    }));
  };

  const handleOpenCalculator = (weight) => {
    setCalculatorWeight(weight);
    setIsCalculatorOpen(true);
  };

  const handleLockIn = (exerciseIndex) => {
    setWorkoutState(produce(draft => {
      draft.coreLifts[exerciseIndex].isLocked = true;
    }));
  };

  const handleOpenSwapModal = (exercise, index) => {
    setExerciseToSwap({ ...exercise, type: 'coreLifts', index });
    setIsSwapModalOpen(true);
  };

  const handleExerciseSelect = (selectedExercise) => {
    const { type, index } = exerciseToSwap;
    setWorkoutState(produce(draft => {
      draft[type][index] = { ...draft[type][index], ...selectedExercise, exerciseId: selectedExercise.id };
    }));
    setIsSwapModalOpen(false);
  };
  
  const handleOpenAdjustWeightModal = (exercise, index) => {
    setExerciseToAdjust({ ...exercise, type: 'coreLifts', index });
    setIsAdjustWeightModalOpen(true);
  };

  const handleUpdateWeight = (newWeight) => {
    const { type, index } = exerciseToAdjust;
    setWorkoutState(produce(draft => {
      draft[type][index].weight = newWeight;
    }));
    setIsAdjustWeightModalOpen(false);
  };

  const handleSubSetUpdate = (exerciseIndex, field, value) => {
    setWorkoutState(produce(draft => {
      draft.subSetWorkout[exerciseIndex][field] = value;
    }));
  };

  const handleSubSetSetToggle = (exerciseIndex, setIndex) => {
    setWorkoutState(produce(draft => {
      const currentStatus = draft.subSetWorkout[exerciseIndex].sets[setIndex].completed;
      draft.subSetWorkout[exerciseIndex].sets[setIndex].completed = !currentStatus;
    }));
  };

  const handleDiscardWorkout = () => {
    if (window.confirm("Are you sure you want to discard this workout and start a new one? Your progress won't be saved.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      navigate('/');
    }
  };

  const handleSaveWorkout = async () => {
    if (!currentUser || !workoutState) return;
    setIsSaving(true);

    const finalLifts = workoutState.coreLifts.map(lift => {
      const completedSets = lift.sets.filter(s => s.completed).length;
      const isSuccessful = completedSets === lift.sets.length;
      return { ...lift, isSuccessful };
    });

    const timeTakenString = `${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s`;
    const workoutData = {
      name: workoutIdRef.current,
      workoutType: '5x5',
      duration: elapsedTime,
      timeTaken: timeTakenString,
      exercises: finalLifts.map(ex => ({
        name: ex.name,
        weight: ex.weight,
        sets: ex.sets.map(set => set.reps || 0),
        progressionStatus: ex.isSuccessful ? 'successful' : 'failed',
      })),
    };
    
    try {
      await saveWorkoutSession(currentUser.uid, workoutData);

      for (const lift of finalLifts) {
        let newWeight = lift.weight;
        let newFailureCount = lift.failureCount || 0;

        if (lift.isSuccessful) {
          newWeight += lift.increment;
          newFailureCount = 0;
        } else {
          newFailureCount++;
          if (newFailureCount >= 3) {
            newWeight = Math.max(45, Math.round((lift.weight * 0.9) / 5) * 5);
            newFailureCount = 0;
          }
        }
        await updateUserProgressAfterWorkout(currentUser.uid, lift.exerciseId, {
          currentWeight: newWeight,
          failureCount: newFailureCount,
        });
      }

      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSaveMessage('Workout saved successfully!');
    } catch (err) {
      setError('Failed to save workout session.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <p className="text-center text-gray-300">Loading workout...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!workoutState) return <p className="text-center text-gray-300">No workout loaded.</p>;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h2 className="mb-4 text-center text-4xl font-bold text-white">{workoutTemplates[workoutIdRef.current]?.name}</h2>
      
      <div className="space-y-6">
        {workoutState.coreLifts.map((lift, index) => (
          <ExerciseDisplay
            key={lift.exerciseId}
            exercise={lift}
            onSetToggle={(setIndex) => handleSetToggle(index, setIndex)}
            onOpenSwapModal={() => handleOpenSwapModal(lift, index)}
            onOpenCalculator={handleOpenCalculator}
            onOpenAdjustWeightModal={() => handleOpenAdjustWeightModal(lift, index)}
            onLockIn={() => handleLockIn(index)}
          />
        ))}
      </div>

      {workoutState.subSetWorkout && (
        <SubSetWorkout 
            exercises={workoutState.subSetWorkout}
            onSetToggle={handleSubSetSetToggle}
            onWeightChange={(index, newWeight) => handleSubSetUpdate(index, 'weight', newWeight)}
            onIncrement={(index) => handleSubSetUpdate(index, 'weight', workoutState.subSetWorkout[index].weight + 5)}
            onDecrement={(index) => handleSubSetUpdate(index, 'weight', Math.max(0, workoutState.subSetWorkout[index].weight - 5))}
            onLockIn={(index) => handleSubSetUpdate(index, 'isLocked', true)}
        />
      )}

      <div className="mt-8 text-center">
        {saveMessage ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-green-400">{saveMessage}</p>
            <Link to="/" className="w-full rounded-lg bg-green-600 px-8 py-3 font-bold text-white hover:bg-green-700 md:w-auto">Go to Dashboard</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:justify-center">
            <button
                onClick={handleDiscardWorkout}
                className="w-full rounded-lg bg-gray-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-gray-500 md:w-auto"
            >
                Discard Workout
            </button>
            <button 
                onClick={handleSaveWorkout} 
                disabled={isSaving} 
                className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400 md:w-auto"
            >
                {isSaving ? 'Saving...' : 'Finish & Save Workout'}
            </button>
          </div>
        )}
      </div>
      
      <ExerciseSwapModal isOpen={isSwapModalOpen} onClose={() => setIsSwapModalOpen(false)} onExerciseSelect={handleExerciseSelect} exerciseToSwap={exerciseToSwap} />
      <PlateCalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} targetWeight={calculatorWeight} barbellWeight={userSettings?.barbellWeight} />
      <AdjustWeightModal isOpen={isAdjustWeightModalOpen} onClose={() => setIsAdjustWeightModalOpen(false)} onSubmit={handleUpdateWeight} currentWeight={exerciseToAdjust?.weight || 0} />
    </div>
  );
};

export default WorkoutView;