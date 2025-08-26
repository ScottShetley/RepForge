import React from 'react';

// This is a placeholder for the component that will display a single circuit machine.
const CircuitExercise = ({exercise}) => {
  return (
    <div className="border border-gray-700 rounded-lg p-4 my-4">
      <h4 className="text-xl font-semibold text-cyan-400">{exercise.name}</h4>
      <p className="text-gray-500 mb-4">{exercise.bodyPart}</p>

      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Weight (lbs)
          </label>
          <input
            type="number"
            className="bg-gray-700 rounded-md p-2 w-24"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Reps
          </label>
          <input
            type="number"
            className="bg-gray-700 rounded-md p-2 w-24"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};

export default CircuitExercise;
