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
      { id: 'acc02', name: 'Tricep Pushdowns', sets: 3, reps: '8-12' },
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
        { id: 'acc03', name: 'Pull-ups', sets: 3, reps: 'As many as possible' },
        { id: 'acc04', name: 'Bicep Curls', sets: 3, reps: '8-12' },
      ],
  },
};

const WorkoutView = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [workoutState, setWorkoutState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // --- Start of Surgical Change 1: Add Timer State & Effect ---
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);

  useEffect(() => {
    let timer;
    if (!loading && workoutState && !workoutCompleted) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, workoutState, workoutCompleted]);
  // --- End of Surgical Change 1 ---

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restDuration] = useState(90); // Lint fix: removed unused setRestDuration
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorWeight, setCalculatorWeight] = useState(0);
  const [isAdjustWeightModalOpen, setIsAdjustWeightModalOpen] = useState(false);
  const [exerciseToAdjust, setExerciseToAdjust] = useState(null);
  const [userSettings, setUserSettings] = useState({ barbellWeight: 45 });
  const workoutIdRef = useRef(null);

  useEffect(() => {
    const initializeWorkout = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const settings = await getUserSettings(currentUser.uid);
        if (settings) {
          setUserSettings(settings);
        }

        const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSession) {
          const { workoutId, state, currentExerciseIndex: savedIndex } = JSON.parse(savedSession);
          workoutIdRef.current = workoutId;
          setWorkoutState(state);
          setCurrentExerciseIndex(savedIndex);
          setLoading(false);
          return;
        }

        const lastWorkout = await getLastWorkout(currentUser.uid);
        const workoutId = lastWorkout?.name === 'Workout A' ? 'workoutB' : 'workoutA';
        workoutIdRef.current = workoutId;

        const template = workoutTemplates[workoutId];
        const progress = await getUserProgress(currentUser.uid);

        const initialCoreLifts = template.coreLifts.map(lift => {
          const liftProgress = progress[lift.exerciseId] || { weight: 45, isSuccessful: true, failedAttempts: 0 };
          let weight = liftProgress.weight;

          if (!liftProgress.isSuccessful && lift.exerciseId !== 'deadlift') {
            weight = Math.max(45, weight * 0.9);
          }

          return {
            ...lift,
            weight: weight,
            sets: Array(lift.sets).fill({ reps: null, completed: false }),
            progressionStatus: 'pending',
            isNewPR: false,
          };
        });

        const initialState = { coreLifts: initialCoreLifts, subSetWorkout: template.subSetWorkout };
        setWorkoutState(initialState);
      } catch (err) {
        console.error("Failed to initialize workout:", err);
        setError('There was an issue setting up your workout.');
      } finally {
        setLoading(false);
      }
    };

    initializeWorkout();
  }, [currentUser, location.state]);

  useEffect(() => {
    if (workoutState) {
      const sessionToSave = {
        workoutId: workoutIdRef.current,
        state: workoutState,
        currentExerciseIndex: currentExerciseIndex,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionToSave));
    }
  }, [workoutState, currentExerciseIndex]);


  const handleSetComplete = (exerciseIndex, setIndex, reps) => {
    const newState = produce(workoutState, draft => {
      draft.coreLifts[exerciseIndex].sets[setIndex] = { reps, completed: true };
    });
    setWorkoutState(newState);
  };

  const handleNextExercise = () => {
    const currentLift = workoutState.coreLifts[currentExerciseIndex];
    const completedSets = currentLift.sets.filter(s => s.completed).length;
    let progressionStatus = 'pending';

    if (completedSets === currentLift.sets) {
      progressionStatus = 'successful';
    } else if (completedSets < currentLift.sets && completedSets > 0) {
      progressionStatus = 'partial';
    } else {
      progressionStatus = 'failed';
    }

    const newState = produce(workoutState, draft => {
      draft.coreLifts[currentExerciseIndex].progressionStatus = progressionStatus;
    });
    setWorkoutState(newState);

    if (currentExerciseIndex < workoutState.coreLifts.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setIsResting(true);
    } else {
      setWorkoutCompleted(true);
    }
  };


  const handleOpenSwapModal = (exercise, type, index) => {
    setExerciseToSwap({ ...exercise, type, index });
    setIsSwapModalOpen(true);
  };

  const handleCloseSwapModal = () => {
    setIsSwapModalOpen(false);
    setExerciseToSwap(null);
  };

  const handleExerciseSelect = (selectedExercise) => {
    const { type, index } = exerciseToSwap;
    const newState = produce(workoutState, draft => {
      draft[type][index] = { ...draft[type][index], ...selectedExercise, exerciseId: selectedExercise.id };
    });
    setWorkoutState(newState);
    handleCloseSwapModal();
  };

  const handleOpenCalculator = (weight) => {
    setCalculatorWeight(weight);
    setIsCalculatorOpen(true);
  };

  const handleCloseCalculator = () => {
    setIsCalculatorOpen(false);
  };

  const handleOpenAdjustWeightModal = (exercise, type, index) => {
    setExerciseToAdjust({ ...exercise, type, index });
    setIsAdjustWeightModalOpen(true);
  };

  const handleCloseAdjustWeightModal = () => {
    setIsAdjustWeightModalOpen(false);
    setExerciseToAdjust(null);
  };

  const handleUpdateWeight = (newWeight) => {
    const { type, index } = exerciseToAdjust;
    const newState = produce(workoutState, draft => {
      draft[type][index].weight = newWeight;
    });
    setWorkoutState(newState);
    handleCloseAdjustWeightModal();
  };

  const handleDiscardWorkout = () => {
    if (window.confirm("Are you sure you want to discard this workout and start a new one? Your progress won't be saved.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setWorkoutState(null);
      setCurrentExerciseIndex(0);
      navigate(0);
    }
  };

  const handleSaveWorkout = async () => {
    if (!currentUser || !workoutState) return;
    setIsSaving(true);
    setWorkoutCompleted(true);

    // --- Start of Surgical Change 2: Update Save Logic ---
    const timeTakenString = `${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s`;

    const workoutData = {
      userId: currentUser.uid,
      name: workoutIdRef.current,
      workoutType: '5x5',
      duration: elapsedTime,
      timeTaken: timeTakenString,
      exercisesCompleted: workoutState.coreLifts.length, // FIX: Added missing field
      exercises: workoutState.coreLifts.map(ex => ({
        name: ex.name,
        weight: ex.weight,
        sets: ex.sets.map(set => set.reps),
        progressionStatus: ex.progressionStatus,
        isNewPR: ex.isNewPR || false,
        increment: userSettings.progression?.[ex.exerciseId] || 5
      })),
      createdAt: new Date(),
    };

    try {
      await saveWorkoutSession(workoutData);
      await updateUserProgressAfterWorkout(currentUser.uid, workoutState.coreLifts);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSaveMessage('Workout saved successfully!');
    } catch (err) {
      setError('Failed to save workout session.');
      console.error(err);
      setSaveMessage('Error saving workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
    // --- End of Surgical Change 2 ---
  };
  
  if (loading) {
    return <MainLayout><p className="text-center text-gray-300">Loading workout...</p></MainLayout>;
  }

  if (error) {
    return <MainLayout><p className="text-center text-red-500">{error}</p></MainLayout>;
  }

  if (!workoutState) {
    return <MainLayout><p className="text-center text-gray-300">No workout loaded.</p></MainLayout>;
  }

  const currentExercise = workoutState.coreLifts[currentExerciseIndex];

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h2 className="mb-4 text-center text-4xl font-bold text-white">{workoutTemplates[workoutIdRef.current]?.name}</h2>
      
      {!workoutCompleted ? (
        <ExerciseDisplay
          exercise={currentExercise}
          onSetComplete={(setIndex, reps) => handleSetComplete(currentExerciseIndex, setIndex, reps)}
          onNextExercise={handleNextExercise}
          onOpenSwapModal={() => handleOpenSwapModal(currentExercise, 'coreLifts', currentExerciseIndex)}
          onOpenCalculator={handleOpenCalculator}
          onOpenAdjustWeightModal={() => handleOpenAdjustWeightModal(currentExercise, 'coreLifts', currentExerciseIndex)}
          isLastExercise={currentExerciseIndex === workoutState.coreLifts.length - 1}
        />
      ) : (
        <SubSetWorkout
          exercises={workoutState.subSetWorkout}
          onUpdate={(index, data) => {
            const newState = produce(workoutState, draft => {
                Object.assign(draft.subSetWorkout[index], data);
            });
            setWorkoutState(newState);
          }}
        />
      )}
      
      <div className="mt-8 text-center">
        {workoutCompleted ? (
          <div className="flex flex-col items-center gap-4">
            {!saveMessage && (
              <div className="flex flex-col gap-4 md:flex-row">
                <button onClick={handleDiscardWorkout} className="w-full rounded-lg bg-gray-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-gray-500 md:w-auto">Discard & Start New</button>
                <button onClick={handleSaveWorkout} disabled={isSaving} className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400 md:w-auto">{isSaving ? 'Saving...' : 'Finish & Save Workout'}</button>
              </div>
            )}
            <Link to="/" className="inline-block w-full rounded-lg bg-green-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-green-700 md:w-auto">Go to Dashboard</Link>
            {saveMessage && (<p className="mt-4 text-sm text-gray-300">{saveMessage}</p>)}
          </div>
        ) : null }
      </div>
      
      <ExerciseSwapModal isOpen={isSwapModalOpen} onClose={handleCloseSwapModal} onExerciseSelect={handleExerciseSelect} exerciseToSwap={exerciseToSwap} />
      <PlateCalculatorModal isOpen={isCalculatorOpen} onClose={handleCloseCalculator} targetWeight={calculatorWeight} barbellWeight={userSettings?.barbellWeight} />
      <AdjustWeightModal isOpen={isAdjustWeightModalOpen} onClose={handleCloseAdjustWeightModal} onSubmit={handleUpdateWeight} currentWeight={ exerciseToAdjust && workoutState ? workoutState.coreLifts[exerciseToAdjust.index].weight : 0 } />
      <RestTimer isResting={isResting} duration={restDuration} onRestEnd={() => setIsResting(false)} />
    </div>
  );
};

export default WorkoutView;