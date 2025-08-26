import React from 'react';

const CircuitExercise = ({exercise, workoutEntry, onInputChange}) => {
  const handleWeightChange = e => {
    onInputChange (exercise.id, 'weight', e.target.value);
  };

  const handleRepsChange = e => {
    onInputChange (exercise.id, 'reps', e.target.value);
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4 my-4 bg-gray-800">
      <h4 className="text-xl font-semibold text-cyan-400">{exercise.name}</h4>
      <p className="text-gray-500 mb-4">{exercise.bodyPart}</p>

      {/* --- MODIFICATION START: Replaced Flexbox with a more robust Grid layout --- */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Weight (lbs)
          </label>
          <input
            type="number"
            className="bg-gray-700 rounded-md p-2 w-full text-white" // Use w-full to fill the grid cell
            placeholder="0"
            value={workoutEntry.weight}
            onChange={handleWeightChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Reps
          </label>
          <input
            type="number"
            className="bg-gray-700 rounded-md p-2 w-full text-white" // Use w-full to fill the grid cell
            placeholder="0"
            value={workoutEntry.reps}
            onChange={handleRepsChange}
          />
        </div>
      </div>
      {/* --- MODIFICATION END --- */}
    </div>
  );
};

export default CircuitExercise;
