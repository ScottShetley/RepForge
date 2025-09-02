import React from 'react';
import {FaArrowRight} from 'react-icons/fa';

const UpNextWorkout = ({workout, onStartWorkout}) => {
  if (!workout) {
    return null;
  }

  const {name, id, exercises} = workout;

  return (
    <div className="mb-6 rounded-lg bg-gray-800 p-4 shadow-lg">
      <h3 className="mb-3 text-lg font-bold text-white">Up Next: {name}</h3>
      <div className="space-y-3">
        {exercises.map (ex => (
          <div
            key={ex.exerciseId}
            className="flex items-center justify-between rounded-md bg-gray-700 p-2"
          >
            <div>
              <p className="font-semibold text-gray-200">{ex.name}</p>
              <p className="text-xs text-gray-400">
                Target: {ex.weight} lbs • {ex.sets}x{ex.reps}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onStartWorkout (id)}
        className="mt-4 flex w-full items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 font-bold text-white transition-colors hover:bg-cyan-600"
      >
        Start Workout
        <FaArrowRight className="ml-2" />
      </button>
    </div>
  );
};

export default UpNextWorkout;
