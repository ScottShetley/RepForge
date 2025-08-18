import React, { useState } from 'react';
import SetLogger from './SetLogger';

const PencilIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className="w-5 h-5"
  >
    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
  </svg>
);

const CalculatorIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className="w-5 h-5"
  >
    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.5 4.5a.5.5 0 00-1 0v11a.5.5 0 001 0v-11zM15.5 4.5a.5.5 0 00-1 0v11a.5.5 0 001 0v-11zM6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);


const ExerciseDisplay = ({ exercise, onSetToggle, onSwap, isComplete, onWeightAdjust, onCalculatorOpen }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weightToAdd, setWeightToAdd] = useState('');

  const handleAdjust = () => {
    const value = parseFloat(weightToAdd);
    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid, positive number.");
      return;
    }
    onWeightAdjust(value);
    setWeightToAdd('');
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="rounded-lg bg-gray-700 p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{exercise.name}</h3>
              {exercise.increment ? (
                <p className="font-semibold text-gray-300">
                  {exercise.sets}x{exercise.reps} &bull; {exercise.weight} lbs
                </p>
              ) : (
                 <p className="font-semibold text-gray-300">
                  {exercise.sets}x{exercise.reps}
                </p>
              )}
            </div>
            {exercise.increment && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                  aria-label="Adjust weight"
                  disabled={isComplete}
                >
                  <PencilIcon />
                </button>
                <button
                  onClick={() => onCalculatorOpen(exercise.weight)}
                  className="text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                  aria-label="Plate Calculator"
                  disabled={isComplete}
                >
                  <CalculatorIcon />
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={onSwap}
            className="rounded-lg bg-gray-600 py-2 px-4 text-sm font-bold text-white hover:bg-gray-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={isComplete}
          >
            Swap
          </button>
        </div>
        <SetLogger
          totalSets={exercise.sets}
          completedSets={exercise.completedSets}
          onSetToggle={onSetToggle}
          isComplete={isComplete}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="w-full max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl">
            <h4 className="text-xl font-bold text-white">Adjust Weight</h4>
            <p className="mt-1 text-sm text-gray-400">
              Enter the amount of weight you want to add for this session.
            </p>
            <div className="mt-4">
              <label htmlFor="weight-to-add" className="sr-only">Weight to Add (lbs)</label>
              <input
                type="number"
                id="weight-to-add"
                value={weightToAdd}
                onChange={(e) => setWeightToAdd(e.target.value)}
                className="w-full rounded-md border-gray-600 bg-gray-700 p-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="e.g., 20"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
              >
                Add Weight
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExerciseDisplay;