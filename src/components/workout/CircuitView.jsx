import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  getExercisesByCategory,
  saveCircuitWorkout,
} from '../../services/firebase';
import {useAuth} from '../../hooks/useAuth';
import CircuitExercise from './CircuitExercise';

const CircuitView = () => {
  const [exercises, setExercises] = useState ([]);
  const [workoutData, setWorkoutData] = useState ({});
  const [loading, setLoading] = useState (true);
  const [error, setError] = useState ('');
  const [isSaving, setIsSaving] = useState (false);

  const {currentUser} = useAuth ();
  const navigate = useNavigate ();

  useEffect (() => {
    const fetchCircuitExercises = async () => {
      try {
        setLoading (true);
        const circuitExercises = await getExercisesByCategory ('Circuit');
        setExercises (circuitExercises);

        // Initialize workoutData state for each exercise
        const initialData = {};
        circuitExercises.forEach (ex => {
          initialData[ex.id] = {name: ex.name, weight: '', reps: ''};
        });
        setWorkoutData (initialData);
      } catch (err) {
        setError ('Failed to load exercises.');
        console.error (err);
      } finally {
        setLoading (false);
      }
    };

    fetchCircuitExercises ();
  }, []);

  const handleInputChange = (exerciseId, field, value) => {
    setWorkoutData (prevData => ({
      ...prevData,
      [exerciseId]: {
        ...prevData[exerciseId],
        [field]: value === '' ? '' : Number (value),
      },
    }));
  };

  const handleSaveWorkout = async () => {
    if (!currentUser) {
      setError ('You must be logged in to save a workout.');
      return;
    }
    setIsSaving (true);

    // Filter out exercises that haven't been filled out
    const completedExercises = Object.values (workoutData).filter (
      ex => ex.weight > 0 && ex.reps > 0
    );

    if (completedExercises.length === 0) {
      setError ('Please enter weight and reps for at least one exercise.');
      setIsSaving (false);
      return;
    }

    try {
      await saveCircuitWorkout (currentUser.uid, {
        exercises: completedExercises,
      });
      navigate ('/'); // Navigate back to dashboard on success
    } catch (err) {
      setError ('Failed to save workout. Please try again.');
      console.error (err);
      setIsSaving (false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-400">Loading circuit exercises...</p>
    );
  }

  if (error) {
    return <p className="text-center text-red-400">{error}</p>;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="space-y-4">
        {exercises.map (exercise => (
          <CircuitExercise
            key={exercise.id}
            exercise={exercise}
            workoutEntry={workoutData[exercise.id] || {weight: '', reps: ''}}
            onInputChange={handleInputChange}
          />
        ))}
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={handleSaveWorkout}
          disabled={isSaving}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save and Finish Circuit'}
        </button>
      </div>
    </div>
  );
};

export default CircuitView;
