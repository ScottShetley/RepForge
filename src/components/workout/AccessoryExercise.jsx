import React from 'react';
import SetLogger from './SetLogger';

const AccessoryExercise = ({exercise, onSetToggle}) => {
  return (
    <div className="border-b border-gray-700 py-3 last:border-b-0">
      <div className="flex items-center justify-between">
        <p className="text-gray-300">{exercise.name}</p>
        <p className="text-lg font-semibold text-cyan-400">
          {exercise.sets}x{exercise.reps}
        </p>
      </div>
      <div className="mt-3">
        <SetLogger
          totalSets={exercise.sets}
          completedSets={exercise.completedSets}
          onSetToggle={onSetToggle}
        />
      </div>
    </div>
  );
};

export default AccessoryExercise;
