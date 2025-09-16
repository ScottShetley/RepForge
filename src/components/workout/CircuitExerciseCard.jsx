import React, { useState, useEffect } from 'react';
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
            index < completedCount ? 'bg-green-400' : 'bg-gray-500'
          } ${disabled ? 'cursor-not-allowed' : 'hover:bg-green-300'}`}
          aria-label={`Set ${index + 1}`}
        />
      ))}
    </div>
  );
};

const CircuitExerciseCard = ({ exercise, onUpdate, onLockIn, disabled, isLocked, initialData, targetWeight }) => {
  const [state, setState] = useState({
    weight: initialData?.weight || '',
    completedSets: initialData?.completedSets || 0,
  });

  // Effect to update weight if targetWeight loads after initial render
  useEffect(() => {
    // Handle both object and primitive types for targetWeight
    const weightToSet = typeof targetWeight === 'object' && targetWeight !== null
      ? targetWeight.currentWeight
      : targetWeight;

    if (!initialData?.weight && weightToSet) {
        setState(s => ({...s, weight: weightToSet}));
    }
  }, [targetWeight, initialData?.weight]);


  const effectiveDisabled = disabled || isLocked;

  const handleWeightChange = (e) => {
    const newWeight = e.target.value;
    setState(s => ({...s, weight: newWeight}));
    onUpdate(exercise.id, 'weight', newWeight);
  };

  const handleSetToggle = (setNumber) => {
    const newCompletedSets = state.completedSets === setNumber ? setNumber - 1 : setNumber;
    setState(s => ({...s, completedSets: newCompletedSets}));
    onUpdate(exercise.id, 'completedSets', newCompletedSets);
  };

  const handleLockInClick = () => {
    onLockIn(exercise.id);
  };

  // Check if targetWeight is an object and render the correct property.
  const displayTargetWeight = typeof targetWeight === 'object' && targetWeight !== null
    ? targetWeight.currentWeight
    : targetWeight;


  return (
    <div className={`rounded-lg bg-gray-800 p-4 shadow-md transition-all duration-300 ${isLocked ? 'border-2 border-green-500' : 'border-2 border-transparent'}`}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h4 className="text-xl font-bold text-white">{exercise.name}</h4>
          {displayTargetWeight && <p className="text-xs text-cyan-400 mb-1">Target: {displayTargetWeight} lbs</p>}
        </div>

        <div className="flex w-full flex-wrap items-center justify-start gap-4 sm:w-auto sm:justify-end">
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
              className="w-full rounded-md border-gray-600 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400 sm:w-28"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-400">Reps</label>
            <div className="flex h-10 w-full min-w-[4rem] items-center justify-center rounded-md bg-gray-600 p-2 text-gray-300">
              12
            </div>
          </div>

          <div className="flex flex-1 basis-24 flex-col">
            <label className="mb-1 text-sm font-medium text-gray-400">Sets</label>
            <div className="w-full rounded-md border-2 border-gray-600 bg-gray-700 p-2">
              <SetLogger count={3} completedCount={state.completedSets} onToggle={handleSetToggle} disabled={effectiveDisabled} />
            </div>
          </div>

          <div className="flex items-end">
            {/* --- SURGICAL CHANGE (TEXT) START --- */}
            <button
              onClick={handleLockInClick}
              disabled={effectiveDisabled}
              className="h-10 rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
              aria-label="Lock in exercise"
            >
              <div className="flex items-center gap-2">
                <FaLock />
                <span>{isLocked ? 'Locked In' : 'Lock In'}</span>
              </div>
            </button>
            {/* --- SURGICAL CHANGE (TEXT) END --- */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitExerciseCard;