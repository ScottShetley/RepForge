import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { produce } from 'immer';
import MainLayout from '../components/layout/MainLayout';
import CircuitExerciseCard from '../components/workout/CircuitExerciseCard';
import { useAuth } from '../hooks/useAuth';
import { getExercisesByCategory, saveWorkoutSession } from '../services/firebase';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

// Defined based on the Master Doc
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


const CircuitTracker = () => {
  const [exercises, setExercises] = useState([]);
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
  const circuitType = location.state?.circuitType || 'fullBody'; // Default to fullBody
  
  const storageKey = `inProgressCircuit_${circuitType}_${currentUser?.uid}`;

  useEffect(() => {
    const fetchExercises = async () => {
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
      } catch {
        setError('Failed to load circuit exercises.');
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();

    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      const { state, time, active } = JSON.parse(savedDraft);
      setWorkoutState(state || {});
      setElapsedTime(time || 0);
      setIsSessionActive(active || false);
    }
  }, [circuitType, storageKey]);

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
    setWorkoutState(produce(workoutState, draft => {
      if (!draft[exerciseId]) {
        draft[exerciseId] = { exerciseId };
      }
      Object.assign(draft[exerciseId], data);
    }));
  }, [workoutState]);

  const handleLockIn = useCallback((exerciseId) => {
    setWorkoutState(produce(workoutState, draft => {
      if (!draft[exerciseId]) {
        draft[exerciseId] = { exerciseId, isLocked: true };
      } else {
        draft[exerciseId].isLocked = !draft[exerciseId].isLocked;
      }
    }));
  }, [workoutState]);

  const handleFinishWorkout = async () => {
    setIsSaving(true);
    const lockedInExercises = Object.values(workoutState).filter(ex => ex.isLocked);
    const exercisesWithData = lockedInExercises.map(({ exerciseId, ...data }) => ({
      id: exerciseId,
      name: exercises.find(e => e.id === exerciseId)?.name || 'Unknown Exercise',
      ...data,
    }));

    if (lockedInExercises.length === 0) {
      if (!window.confirm("You haven't locked in any exercises. Are you sure you want to finish without saving?")) {
        setIsSaving(false);
        return;
      }
      localStorage.removeItem(storageKey);
      navigate('/');
      return;
    }

    const finalWorkoutData = {
      name: circuitTitle,
      workoutType: 'circuit',
      totalTimeInSeconds: elapsedTime,
      exercisesCompleted: lockedInExercises.length,
      totalExercises: exercises.length,
      exercises: exercisesWithData,
    };

    try {
      await saveWorkoutSession(currentUser.uid, finalWorkoutData);
      localStorage.removeItem(storageKey);
      navigate('/');
    } catch (err) {
      setError('Failed to save workout. Please try again.');
      console.error(err);
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-400">Loading exercises...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    return (
      <div className="space-y-4">
        {exercises.map(ex => (
          <CircuitExerciseCard
            key={ex.id}
            exercise={ex}
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
              <p className="text-gray-400">Track your progress and earn badges for time and completion!</p>
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