import React, { useState } from 'react';
import { produce } from 'immer';
import { FaLock } from 'react-icons/fa';

const SetLogger = ({ count, completedCount, onToggle, disabled }) => {
  return (
    <div className="flex h-10 items-center justify-center space-x-3">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onToggle(index + 1)}
          disabled={disabled}
          className={`h-4 w-4 rounded-full transition-colors duration-200 ${
            index < completedCount ? 'bg-cyan-400' : 'bg-gray-500'
          } ${disabled ? 'cursor-not-allowed' : 'hover:bg-cyan-300'}`}
          aria-label={`Set ${index + 1}`}
        />
      ))}
    </div>
  );
};

const CircuitExerciseCard = ({ exercise, onUpdate, onLockIn, disabled, isLocked, initialData }) => {
  const [state, setState] = useState({
    weight: initialData?.weight || '',
    completedSets: initialData?.completedSets || 0,
  });

  const handleWeightChange = (e) => {
    const newWeight = e.target.value;
    const newState = produce(state, draft => {
      draft.weight = newWeight;
    });
    setState(newState);
    onUpdate({ weight: Number(newWeight) || 0, completedSets: newState.completedSets });
  };

  const handleSetToggle = (setNumber) => {
    const newState = produce(state, draft => {
      if (draft.completedSets === setNumber) {
        draft.completedSets = setNumber - 1;
      } else {
        draft.completedSets = setNumber;
      }
    });
    setState(newState);
    onUpdate({ weight: Number(newState.weight) || 0, completedSets: newState.completedSets });
  };

  const effectiveDisabled = disabled || isLocked;

  return (
    <div className={`rounded-lg p-4 transition-all duration-300 ${isLocked ? 'bg-green-900/50' : 'bg-gray-800'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
        <button
          onClick={onLockIn}
          disabled={disabled}
          className={`flex items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold transition-colors ${
            isLocked
              ? 'cursor-not-allowed bg-green-500 text-white'
              : 'bg-gray-600 text-gray-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500'
          }`}
        >
          <FaLock />
          {isLocked ? 'Locked' : 'Lock In'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {/* Weight Input */}
        <div className="flex flex-col">
          <label htmlFor={`weight-${exercise.id}`} className="mb-1 text-sm font-medium text-gray-400">
            Weight (lbs)
          </label>
          <input
            id={`weight-${exercise.id}`}
            type="number"
            value={state.weight}
            onChange={handleWeightChange}
            disabled={effectiveDisabled}
            className="w-full rounded-md border-gray-600 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
            placeholder="0"
          />
        </div>

        {/* Reps Display */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-400">Reps</label>
          <div className="flex h-10 w-full items-center justify-center rounded-md bg-gray-600 p-2 text-gray-300">
            12
          </div>
        </div>

        {/* Set Logger */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-400">Sets</label>
          <div className="w-full rounded-md border-2 border-gray-600 bg-gray-700">
             <SetLogger
              count={3}
              completedCount={state.completedSets}
              onToggle={handleSetToggle}
              disabled={effectiveDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitExerciseCard;