import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { produce } from 'immer';
import MainLayout from '../components/layout/MainLayout';
import CircuitExerciseCard from '../components/workout/CircuitExerciseCard';
import { useAuth } from '../hooks/useAuth';
import { getExercisesByCategory, saveWorkoutSession, getCircuitProgress, updateCircuitProgress } from '../services/firebase';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const UPPER_BODY_CIRCUIT_TEMPLATE = [
  { id: 'chest-press-machine', name: 'Chest Press Machine' },
  { id: 'shoulder-press-machine', name: 'Shoulder Press Machine' },
  { id: 'bicep-curl-machine', name: 'Bicep Curl Machine' },
  { id: 'triceps-extension-machine', name: 'Triceps Extension Machine' },
  { id: 'abdominal-crunch-machine', name: 'Abdominal Crunch Machine' },
];

const LOWER_BODY_CIRCUIT_TEMPLATE = [
  { id: 'leg-extension-machine', name: 'Leg Extension Machine' },
  { id: 'seated-leg-curl', name: 'Seated Leg Curl' },
  { id: 'calf-raise-machine', name: 'Calf Raise Machine' },
  { id: 'hip-adduction-machine', name: 'Hip Adduction Machine' },
  { id: 'glute-kickback-machine', name: 'Glute Kickback Machine' },
];

const PROGRESSION_INCREMENT = 5; // 5 lbs increment for circuit exercises

const CircuitTracker = () => {
  const [exercises, setExercises] = useState([]);
  const [circuitProgress, setCircuitProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workoutState, setWorkoutState] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [circuitTitle, setCircuitTitle] = useState('Circuit Tracker');

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const circuitType = location.state?.circuitType || 'fullBody';
  
  const storageKey = `inProgressCircuit_${circuitType}_${currentUser?.uid}`;

  useEffect(() => {
    const loadWorkoutData = async () => {
      if (!currentUser?.uid) return;
      setLoading(true);
      try {
        let loadedExercises;
        switch (circuitType) {
          case 'upperBody':
            setCircuitTitle('Upper Body Circuit');
            loadedExercises = UPPER_BODY_CIRCUIT_TEMPLATE;
            break;
          case 'lowerBody':
            setCircuitTitle('Lower Body Circuit');
            loadedExercises = LOWER_BODY_CIRCUIT_TEMPLATE;
            break;
          case 'fullBody':
          default:
            setCircuitTitle('Full Body Circuit');
            loadedExercises = await getExercisesByCategory('Circuit');
            break;
        }
        setExercises(loadedExercises);

        const progress = await getCircuitProgress(currentUser.uid);
        setCircuitProgress(progress);

        const savedDraft = localStorage.getItem(storageKey);
        if (savedDraft) {
          const { state, time, active } = JSON.parse(savedDraft);
          setWorkoutState(state || {});
          setElapsedTime(time || 0);
          setIsSessionActive(active || false);
        }
      } catch (err) {
        console.error("Error loading workout data:", err);
        setError('Failed to load workout data.');
      } finally {
        setLoading(false);
      }
    };
    loadWorkoutData();
  }, [currentUser?.uid, circuitType, storageKey]);

  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    if (isSessionActive) {
      const draftToSave = {
        state: workoutState,
        time: elapsedTime,
        active: isSessionActive
      };
      localStorage.setItem(storageKey, JSON.stringify(draftToSave));
    }
  }, [workoutState, elapsedTime, isSessionActive, storageKey]);

  const handleUpdate = useCallback((exerciseId, data) => {
    setWorkoutState(produce(draft => {
      if (!draft[exerciseId]) {
        draft[exerciseId] = { exerciseId };
      }
      Object.assign(draft[exerciseId], data);
    }));
  }, []);

  const handleLockIn = useCallback((exerciseId) => {
    setWorkoutState(produce(draft => {
      if (!draft[exerciseId]) {
        draft[exerciseId] = { exerciseId, isLocked: true };
      } else {
        draft[exerciseId].isLocked = !draft[exerciseId].isLocked;
      }
    }));
  }, []);

  const handleFinishWorkout = async () => {
    setIsSaving(true);
    const lockedInExercisesData = Object.values(workoutState).filter(ex => ex.isLocked);

    if (lockedInExercisesData.length === 0) {
      if (!window.confirm("You haven't locked in any exercises. Are you sure you want to finish without saving?")) {
        setIsSaving(false); return;
      }
      localStorage.removeItem(storageKey);
      navigate('/');
      return;
    }

    const newProgressUpdates = {};
    const detailedExercisesForLog = [];

    lockedInExercisesData.forEach(exState => {
      const exerciseDef = exercises.find(e => e.id === exState.exerciseId);
      if (!exerciseDef) return;

      const performedWeight = Number(exState.weight) || 0;
      
      detailedExercisesForLog.push({
        id: exState.exerciseId,
        name: exerciseDef.name,
        weight: performedWeight,
        completedSets: exState.completedSets || 0,
      });

      if (exState.completedSets === 3) {
        newProgressUpdates[exState.exerciseId] = {
          currentWeight: performedWeight + PROGRESSION_INCREMENT
        };
      }
    });

    const timeTakenString = `${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s`;

    const finalWorkoutData = {
      name: circuitTitle,
      workoutType: 'circuit',
      duration: elapsedTime,
      timeTaken: timeTakenString,
      exercisesCompleted: lockedInExercisesData.length,
      totalExercises: exercises.length,
      exercises: detailedExercisesForLog,
      createdAt: new Date(),
    };

    try {
      // --- FIX: This now uses the correct variable name 'finalWorkoutData' ---
      await saveWorkoutSession(currentUser.uid, finalWorkoutData);
      if (Object.keys(newProgressUpdates).length > 0) {
        await updateCircuitProgress(currentUser.uid, newProgressUpdates);
      }
      
      localStorage.removeItem(storageKey);
      navigate('/');
    } catch (err) {
      // Corrected console log for better debugging
      console.error("Error saving workout session:", err);
      setError('Failed to save workout. Please try again.');
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-400">Loading your progress...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    return (
      <div className="space-y-4">
        {exercises.map(ex => (
          <CircuitExerciseCard
            key={ex.id}
            exercise={ex}
            targetWeight={circuitProgress[ex.id]?.currentWeight}
            onUpdate={(data) => handleUpdate(ex.id, data)}
            onLockIn={() => handleLockIn(ex.id)}
            disabled={!isSessionActive}
            isLocked={workoutState[ex.id]?.isLocked || false}
            initialData={workoutState[ex.id]}
          />
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6 rounded-lg bg-gray-800 p-4 shadow-lg">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-3xl font-bold text-white">{circuitTitle}</h2>
              <p className="text-gray-400">Lock in your completed exercises to save progress.</p>
            </div>
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <div className="w-32 rounded-md bg-gray-900 py-2 px-4 text-center text-3xl font-monospace font-bold text-cyan-400">
                {formatTime(elapsedTime)}
              </div>
              {!isSessionActive ? (
                <button
                  onClick={() => setIsSessionActive(true)}
                  className="w-full rounded-md bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-500 sm:w-auto"
                >
                  Start Workout
                </button>
              ) : (
                <button
                  onClick={handleFinishWorkout}
                  disabled={isSaving}
                  className="w-full rounded-md bg-cyan-600 px-6 py-3 font-bold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-800 sm:w-auto"
                >
                  {isSaving ? 'Saving...' : 'Finish Workout'}
                </button>
              )}
            </div>
          </div>
        </div>
        {renderContent()}
      </div>
    </MainLayout>
  );
};

export default CircuitTracker;