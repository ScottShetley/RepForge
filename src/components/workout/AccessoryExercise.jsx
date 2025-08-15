import React from 'react';
import SetLogger from './SetLogger'; // Import the new reusable component

/**
 * Displays a single accessory exercise with a set logger.
 * @param {object} props - The component props.
 * @param {string} props.name - The name of the exercise.
 * @param {number} props.sets - The number of sets.
 * @param {string} props.reps - The rep range for the exercise.
 */
const AccessoryExercise = ({name, sets, reps}) => {
  return (
    <div className="py-3 border-b border-gray-700 last:border-b-0">
      <div className="flex justify-between items-center">
        <p className="text-gray-300">{name}</p>
        <p className="text-lg font-semibold text-cyan-400">
          {sets}x{reps}
        </p>
      </div>
      <div className="mt-3">
        <SetLogger totalSets={sets} />
      </div>
    </div>
  );
};

export default AccessoryExercise;
