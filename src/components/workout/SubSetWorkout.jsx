import React from 'react';
import AccessoryExercise from './AccessoryExercise';

/**
 * Displays a list of subset exercises for the workout.
 * @param {object} props - The component props.
 * @param {Array<object>} props.exercises - An array of subset exercise objects.
 * @param {Function} props.onSetToggle - The master handler function from the parent view.
 */
const SubSetWorkout = ({exercises, onSetToggle}) => {
  if (!exercises || exercises.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 rounded-lg bg-gray-800 p-4 shadow-lg md:p-6">
      <h3 className="mb-2 border-b-2 border-cyan-500 pb-2 text-xl font-bold text-white">
        Subset Workout
      </h3>
      <p className="italic mb-4 text-sm text-gray-400">
        These optional exercises complement the main lifts.
      </p>
      <div className="space-y-2">
        {exercises.map ((exercise, index) => (
          <AccessoryExercise
            key={exercise.id}
            exercise={exercise}
            onSetToggle={setIndex => onSetToggle (index, setIndex)}
          />
        ))}
      </div>
    </div>
  );
};

export default SubSetWorkout;
