import React from 'react';
import SetLogger from './SetLogger';
import { FaCalculator, FaSyncAlt, FaLock, FaPencilAlt } from 'react-icons/fa';

const ExerciseDisplay = ({
  exercise,
  onSetToggle,
  onSwap,
  isComplete,
  onAdjustWeightOpen, // Changed from onWeightAdjust
  onCalculatorOpen,
  onLockIn,
}) => {
  const isLocked = exercise.isLocked || isComplete;

  return (
    <div
      className={`rounded-lg p-4 shadow-md ${
        isLocked ? 'bg-gray-800' : 'bg-gray-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {/* Exercise Name and Details */}
        <div className="mb-2 sm:mb-0">
          <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
          <p className="text-sm text-gray-300">
            {exercise.sets.length}x{exercise.reps} • {exercise.weight} lbs
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          {!isLocked && (
            <>
              {/* --- NEW: Adjust Weight Icon Button --- */}
              <button
                onClick={onAdjustWeightOpen}
                className="rounded bg-gray-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-gray-500"
                aria-label="Adjust weight"
              >
                <FaPencilAlt className="mr-1 inline" /> Adjust
              </button>
              <button
                onClick={onSwap}
                className="rounded bg-gray-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-gray-500"
                aria-label="Swap exercise"
              >
                <FaSyncAlt className="mr-1 inline" /> Swap
              </button>
              <button
                onClick={() => onCalculatorOpen(exercise.weight)}
                className="rounded bg-gray-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-gray-500"
                aria-label="Open plate calculator"
              >
                <FaCalculator />
              </button>
            </>
          )}
          <button
            onClick={onLockIn}
            disabled={isLocked}
            className="rounded bg-cyan-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-gray-500"
          >
            <FaLock className="mr-1 inline" /> Lock it in
          </button>
        </div>
      </div>

      {/* --- REMOVED: Old +/- buttons are gone --- */}

      <div className="mt-2">
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