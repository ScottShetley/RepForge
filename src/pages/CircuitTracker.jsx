import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { produce } from 'immer';
import MainLayout from '../components/layout/MainLayout';
import CircuitExerciseCard from '../components/workout/CircuitExerciseCard';
import { useAuth } from '../hooks/useAuth';
import { saveWorkoutSession, getCircuitProgress, updateCircuitProgress } from '../services/firebase';

const LOCAL_STORAGE_KEY = 'inProgressCircuitWorkout';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const UPPER_BODY_CIRCUIT_TEMPLATE = [
    { id: 'chest-press-machine', name: 'Chest Press Machine' },
    { id: 'seated-row-machine', name: 'Seated Row Machine' },
    { id: 'shoulder-press-machine', name: 'Shoulder Press Machine' },
    { id: 'lat-pull-down-machine', name: 'Lat Pull Down Machine' },
    { id: 'bicep-curl-machine', name: 'Bicep Curl Machine' },
    { id: 'tricep-press-machine', name: 'Tricep Press Machine' },
    { id: 'triceps-extension-machine', name: 'Triceps Extension Machine' },
];

const LOWER_BODY_CIRCUIT_TEMPLATE = [
    { id: 'leg-press-machine', name: 'Leg Press Machine' },
    { id: 'leg-extension-machine', name: 'Leg Extension Machine' },
    { id: 'seated-leg-curl', name: 'Seated Leg Curl' },
    { id: 'glute-kickback-machine', name: 'Glute Kickback Machine' },
    { id: 'hip-adduction-machine', name: 'Hip Adduction Machine' },
    { id: 'calf-raise-machine', name: 'Calf Raise Machine' },
    { id: 'abdominal-crunch-machine', name: 'Abdominal Crunch Machine' },
];


const FULL_BODY_CIRCUIT_TEMPLATE = [
    ...UPPER_BODY_CIRCUIT_TEMPLATE.slice(0, 4),
    ...LOWER_BODY_CIRCUIT_TEMPLATE.slice(0, 3),
];


const CircuitTracker = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { currentUser } = useAuth();
    const [circuitType, setCircuitType] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [workoutState, setWorkoutState] = useState({});
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [targetWeights, setTargetWeights] = useState({});

    // Load workout from local storage on mount
    useEffect(() => {
        const savedWorkout = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedWorkout) {
            const { circuitType, exercises, workoutState, elapsedTime, isSessionActive } = JSON.parse(savedWorkout);
            setCircuitType(circuitType);
            setExercises(exercises);
            setWorkoutState(workoutState);
            setElapsedTime(elapsedTime);
            setIsSessionActive(isSessionActive);
        } else if (state?.circuitType) {
            // Only initialize a new workout if there's no saved one
            initializeNewWorkout(state.circuitType);
        }
    }, [state?.circuitType]);

    // Save workout to local storage on change
    useEffect(() => {
        if (circuitType && Object.keys(workoutState).length > 0) {
            const workoutToSave = {
                circuitType,
                exercises,
                workoutState,
                elapsedTime,
                isSessionActive,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workoutToSave));
        }
    }, [workoutState, elapsedTime, isSessionActive, circuitType, exercises]);

    const initializeNewWorkout = (type) => {
        setCircuitType(type);
        let template = [];
        if (type === 'upperBody') {
            template = UPPER_BODY_CIRCUIT_TEMPLATE;
        } else if (type === 'lowerBody') {
            template = LOWER_BODY_CIRCUIT_TEMPLATE;
        } else {
            template = FULL_BODY_CIRCUIT_TEMPLATE;
        }
        setExercises(template);

        const initialState = template.reduce((acc, ex) => {
            acc[ex.id] = { weight: '', completedSets: 0, isLocked: false };
            return acc;
        }, {});
        setWorkoutState(initialState);
    };

    useEffect(() => {
        const fetchProgress = async () => {
            if (currentUser && exercises.length > 0) {
                const progress = await getCircuitProgress(currentUser.uid);
                if (progress) {
                    setTargetWeights(progress);
                }
            }
        };
        fetchProgress();
    }, [currentUser, exercises]);


    useEffect(() => {
        let timer;
        if (isSessionActive) {
            timer = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isSessionActive]);


    const handleUpdateExercise = useCallback((exerciseId, field, value) => {
        setWorkoutState(
            produce(draft => {
                draft[exerciseId][field] = value;
            })
        );
    }, []);

    const handleLockIn = useCallback((exerciseId) => {
        setWorkoutState(
            produce(draft => {
                draft[exerciseId].isLocked = !draft[exerciseId].isLocked; // Allow unlocking
            })
        );
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
    const handleFinishWorkout = async () => {
        setIsSaving(true);
        const exercisesCompleted = Object.values(workoutState).filter(ex => ex.isLocked).length;

        // --- SURGICAL CHANGE (BUG FIX) START ---
        if (exercisesCompleted === 0) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            navigate('/');
            setIsSaving(false);
            return;
        }
        // --- SURGICAL CHANGE (BUG FIX) END ---

        const totalWeightLifted = Object.values(workoutState).reduce((acc, ex) => {
            return acc + (Number(ex.weight || 0) * ex.completedSets);
        }, 0);

        const workoutData = {
            userId: currentUser.uid,
            workoutType: 'circuit',
            circuitType: circuitType,
            totalTimeInSeconds: elapsedTime,
            exercisesCompleted: exercisesCompleted,
            totalWeightLifted: totalWeightLifted,
            workoutDetails: workoutState,
            createdAt: new Date(),
        };

    try {
      // --- FIX: This now uses the correct two-argument function call ---
      await saveWorkoutSession(currentUser.uid, finalWorkoutData);
      if (Object.keys(newProgressUpdates).length > 0) {
        await updateCircuitProgress(currentUser.uid, newProgressUpdates);
      }
      
      localStorage.removeItem(storageKey);
      navigate('/');
    } catch (err) {
      setError('Failed to save workout. Please try again.');
      console.error(err);
      setIsSaving(false);
    }
  };
        try {
            await saveWorkoutSession(currentUser.uid, workoutData);
            await updateCircuitProgress(currentUser.uid, workoutState);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            navigate('/');
        } catch (error) {
            console.error("Error saving workout session: ", error);
        } finally {
            setIsSaving(false);
        }
    };


    const circuitTitle = circuitType ?
        `${circuitType.charAt(0).toUpperCase() + circuitType.slice(1)} Body Circuit` :
        'Circuit Training';


    return (
        <MainLayout>
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
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

                <div className="space-y-4">
                    {exercises.map((exercise) => (
                        <CircuitExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onUpdate={handleUpdateExercise}
                            onLockIn={handleLockIn}
                            disabled={!isSessionActive}
                            isLocked={workoutState[exercise.id]?.isLocked}
                            initialData={workoutState[exercise.id]}
                            targetWeight={targetWeights[exercise.id]}
                        />
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default CircuitTracker;