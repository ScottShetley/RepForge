import React, {useState} from 'react';
import ExerciseDisplay from './ExerciseDisplay';
import SubSetWorkout from './SubSetWorkout';
import {useAuth} from '../../context/AuthContext'; // Import useAuth
import {saveWorkout} from '../../services/firebase'; // Import saveWorkout

// Mock data - remains for now
const workouts = {
  workoutA: {
    id: 'workout01',
    name: 'Workout A',
    exercises: [
      {id: 'ex01', name: 'Squat', weight: 200, sets: 5, reps: 5},
      {id: 'ex02', name: 'Bench Press', weight: 150, sets: 5, reps: 5},
      {id: 'ex03', name: 'Barbell Row', weight: 135, sets: 5, reps: 5},
    ],
    subSetWorkout: [
      {id: 'acc01', name: 'Inverted Rows', sets: 3, reps: '8-15'},
      {id: 'acc02', name: 'Barbell Curls', sets: 3, reps: '8-12'},
      {id: 'acc03', name: 'Skullcrushers', sets: 3, reps: '8-12'},
      {id: 'acc04', name: 'Overhead Tricep Extensions', sets: 3, reps: '8-12'},
      {id: 'acc13', name: 'Dumbbell Flys', sets: 3, reps: '10-15'},
      {id: 'acc14', name: 'Lateral Raises', sets: 3, reps: '10-15'},
      {id: 'acc15', name: 'Hanging Knee Raises', sets: 3, reps: 'To Failure'},
      {id: 'acc16', name: 'Face Pulls', sets: 3, reps: '15-20'},
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
    subSetWorkout: [
      {id: 'acc05', name: 'Dumbbell Incline Press', sets: 3, reps: '8-12'},
      {id: 'acc06', name: 'Cable Face Pulls', sets: 3, reps: '15-20'},
      {id: 'acc07', name: 'Lat Pulldowns', sets: 3, reps: '10-15'},
      {id: 'acc08', name: 'Leg Press', sets: 3, reps: '10-15'},
      {id: 'acc09', name: 'Leg Curls', sets: 3, reps: '10-15'},
      {id: 'acc10', name: 'Leg Extension', sets: 3, reps: '10-15'},
      {id: 'acc11', name: 'Seated Calf Raise', sets: 4, reps: '15-20'},
      {id: 'acc12', name: 'Hip Abduction Machine', sets: 3, reps: '15-20'},
    ],
  },
};

const WorkoutView = () => {
  const [currentWorkoutId, setCurrentWorkoutId] = useState ('workoutA');
  const [isSaving, setIsSaving] = useState (false);
  const [saveMessage, setSaveMessage] = useState ('');

  const {currentUser} = useAuth (); // Get current user from AuthContext
  const currentWorkoutData = workouts[currentWorkoutId];

  const getButtonClass = workoutId => {
    return currentWorkoutId === workoutId
      ? 'bg-cyan-500 text-white'
      : 'bg-gray-600 text-gray-300 hover:bg-gray-500';
  };

  // --- NEW: Handle Save Workout ---
  const handleSaveWorkout = async () => {
    if (!currentUser) {
      setSaveMessage ('You must be logged in to save a workout.');
      return;
    }

    setIsSaving (true);
    setSaveMessage ('');

    try {
      await saveWorkout (currentUser.uid, {
        name: currentWorkoutData.name,
        exercises: currentWorkoutData.exercises,
        accessoryWork: currentWorkoutData.subSetWorkout,
      });
      setSaveMessage ('Workout saved successfully!');
    } catch (error) {
      setSaveMessage ('Error: Could not save workout.');
      console.error ('Error saving workout:', error);
    } finally {
      setIsSaving (false);
      // Hide the message after 3 seconds
      setTimeout (() => setSaveMessage (''), 3000);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* --- Workout Toggles --- */}
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

      {/* --- Workout Header --- */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">
          {currentWorkoutData.name}
        </h2>
        <span className="text-lg text-gray-400">August 16, 2025</span>
      </div>

      {/* --- Main Exercises --- */}
      <div className="space-y-6">
        {currentWorkoutData.exercises.map (exercise => (
          <ExerciseDisplay key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {/* --- Accessory Work --- */}
      <SubSetWorkout exercises={currentWorkoutData.subSetWorkout} />

      {/* --- NEW: Save Workout Section --- */}
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
