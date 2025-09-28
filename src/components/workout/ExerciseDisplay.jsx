import React from 'react';
import SetLogger from './SetLogger';
import { FaCalculator, FaSyncAlt, FaLock, FaPencilAlt } from 'react-icons/fa';

const ExerciseDisplay = ({
  exercise,
  onSetToggle,
  onOpenSwapModal,
  onOpenCalculator,
  onOpenAdjustWeightModal,
  onLockIn,
}) => {
  const isLocked = exercise.isLocked;

  return (
    <div
      className={`rounded-lg p-4 shadow-md transition-colors ${
        isLocked ? 'bg-green-900/50 border-2 border-green-500' : 'bg-gray-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-2 sm:mb-0">
          <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
          <p className="text-sm text-gray-300">
            {exercise.sets.length}x{exercise.reps} • {exercise.weight} lbs
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isLocked && (
            <>
              <button
                onClick={onOpenAdjustWeightModal}
                className="rounded bg-gray-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-gray-500"
                aria-label="Adjust weight"
              >
                <FaPencilAlt className="mr-1 inline" /> Adjust
              </button>
              <button
                onClick={onOpenSwapModal}
                className="rounded bg-gray-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-gray-500"
                aria-label="Swap exercise"
              >
                <FaSyncAlt className="mr-1 inline" /> Swap
              </button>
              <button
                onClick={() => onOpenCalculator(exercise.weight)}
                className="rounded bg-gray-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-gray-500"
                aria-label="Open plate calculator"
              >
                <FaCalculator className="mr-1 inline" /> Calc
              </button>
            </>
          )}
          <button
            onClick={onLockIn}
            disabled={isLocked}
            className="rounded bg-cyan-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-green-500"
          >
            <FaLock className="mr-1 inline" />
            {isLocked ? 'Locked In' : 'Lock it in'}
          </button>
        </div>
      </div>
      <div className="mt-4">
        <SetLogger
          sets={exercise.sets}
          onSetToggle={onSetToggle}
          isComplete={isLocked}
        />
      </div>
    </div>
  );
};

export default ExerciseDisplay;