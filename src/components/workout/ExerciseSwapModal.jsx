import React, { useState, useEffect } from 'react';
import { getExercisesByCategory } from '../../services/firebase';

const ExerciseSwapModal = ({ isOpen, onClose, onExerciseSelect, exerciseToSwap }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && exerciseToSwap) {
      const fetchAlternatives = async () => {
        setIsLoading(true);
        try {
          const exercises = await getExercisesByCategory(exerciseToSwap.category);
          // Filter out the exercise we are trying to swap
          const filtered = exercises.filter(ex => ex.name !== exerciseToSwap.name);
          setAlternatives(filtered);
        } catch (error) {
          console.error("Failed to fetch alternatives:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAlternatives();
    }
  }, [isOpen, exerciseToSwap]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-white">Swap {exerciseToSwap?.name}</h3>
        <div className="mt-4 h-64 overflow-y-auto pr-2">
          {isLoading ? (
            <p className="text-gray-300">Loading alternatives...</p>
          ) : (
            <ul className="space-y-2">
              {alternatives.map(exercise => (
                <li key={exercise.id}>
                  <button
                    onClick={() => onExerciseSelect(exercise)}
                    className="w-full rounded-lg bg-gray-700 p-3 text-left text-white transition hover:bg-gray-600"
                  >
                    {exercise.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-600 px-4 py-2 font-semibold text-white hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSwapModal;