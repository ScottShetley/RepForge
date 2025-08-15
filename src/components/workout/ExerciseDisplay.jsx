import React from 'react';
import SetLogger from './SetLogger'; // Import the new reusable component

const ExerciseDisplay = ({exercise}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white">{exercise.name}</h3>
          <p className="text-gray-300 font-semibold">
            {exercise.sets}x{exercise.reps} &bull; {exercise.weight} lbs
          </p>
        </div>
        <button className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm">
          Swap
        </button>
      </div>
      <SetLogger totalSets={exercise.sets} />
    </div>
  );
};

export default ExerciseDisplay;
