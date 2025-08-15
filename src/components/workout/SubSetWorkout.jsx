import React from 'react';
import AccessoryExercise from './AccessoryExercise';

/**
 * Displays a list of subset exercises for the workout.
 * @param {object} props - The component props.
 * @param {Array<object>} props.exercises - An array of subset exercise objects.
 */
const SubSetWorkout = ({exercises}) => {
  if (!exercises || exercises.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-2 border-b-2 border-cyan-500 pb-2">
        SubSet Workout
      </h3>
      {/* NEW: Added descriptive text about the exercises being optional */}
      <p className="text-sm text-gray-400 italic mb-4">
        These exercises are optional and intended to complement the main lifts. Feel free to do some or all of them.
      </p>
      <div className="space-y-2">
        {exercises.map (exercise => (
          <AccessoryExercise
            key={exercise.id}
            name={exercise.name}
            sets={exercise.sets}
            reps={exercise.reps}
          />
        ))}
      </div>
    </div>
  );
};

export default SubSetWorkout;
