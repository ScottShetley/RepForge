import React, {useState} from 'react';
import ExerciseDisplay from './ExerciseDisplay';
import SubSetWorkout from './SubSetWorkout';

const workouts = {
  workoutA: {
    id: 'workout01',
    name: 'Workout A',
    exercises: [
      {id: 'ex01', name: 'Squat', weight: 200, sets: 5, reps: 5},
      {id: 'ex02', name: 'Bench Press', weight: 150, sets: 5, reps: 5},
      {id: 'ex03', name: 'Barbell Row', weight: 135, sets: 5, reps: 5},
    ],
    // UPDATED: Expanded list to 8 exercises to match Workout B
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
  const currentWorkoutData = workouts[currentWorkoutId];

  const getButtonClass = workoutId => {
    return currentWorkoutId === workoutId
      ? 'bg-cyan-500 text-white'
      : 'bg-gray-600 text-gray-300 hover:bg-gray-500';
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setCurrentWorkoutId ('workoutA')}
          className={`w-full md:w-auto px-6 py-2 font-bold rounded-lg transition-colors duration-200 ${getButtonClass ('workoutA')}`}
        >
          Workout A
        </button>
        <button
          onClick={() => setCurrentWorkoutId ('workoutB')}
          className={`w-full md:w-auto px-6 py-2 font-bold rounded-lg transition-colors duration-200 ${getButtonClass ('workoutB')}`}
        >
          Workout B
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">
          {currentWorkoutData.name}
        </h2>
        <span className="text-lg text-gray-400">August 15, 2025</span>
      </div>

      <div className="space-y-6">
        {currentWorkoutData.exercises.map (exercise => (
          <ExerciseDisplay key={exercise.id} exercise={exercise} />
        ))}
      </div>

      <SubSetWorkout exercises={currentWorkoutData.subSetWorkout} />
    </div>
  );
};

export default WorkoutView;
