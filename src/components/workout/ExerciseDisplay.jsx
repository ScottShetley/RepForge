import React from 'react';
import SetLogger from './SetLogger';

const ExerciseDisplay = ({exercise, onSetToggle}) => {
  return (
    <div className="rounded-lg bg-gray-700 p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">{exercise.name}</h3>
          <p className="font-semibold text-gray-300">
            {exercise.sets}x{exercise.reps} &bull; {exercise.weight} lbs
          </p>
        </div>
        <button className="rounded-lg bg-gray-600 py-2 px-4 text-sm font-bold text-white hover:bg-gray-500">
          Swap
        </button>
      </div>
      <SetLogger
        totalSets={exercise.sets}
        completedSets={exercise.completedSets}
        onSetToggle={onSetToggle}
      />
    </div>
  );
};

export default ExerciseDisplay;
