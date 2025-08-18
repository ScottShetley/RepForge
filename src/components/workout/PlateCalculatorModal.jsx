import React from 'react';
import { calculatePlates } from '../../utils/calculations';

const PlateCalculatorModal = ({ isOpen, onClose, targetWeight, barbellWeight }) => {
  if (!isOpen) return null;

  const platesPerSide = calculatePlates(targetWeight, barbellWeight);

  const renderPlateList = () => {
    if (platesPerSide === null || platesPerSide.length === 0) {
      return <li className="text-gray-400">No plates needed.</li>;
    }
    return platesPerSide.map(plate => (
      <li key={plate.weight} className="flex justify-between text-lg text-gray-200">
        <span>{plate.count}x</span>
        <span>{plate.weight} lbs</span>
      </li>
    ));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xs rounded-lg bg-gray-800 p-6 shadow-xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-xl font-bold text-cyan-400">Plate Calculator</h4>
        <div className="mt-2 text-sm text-gray-400">
          <p>Target: <span className="font-bold text-white">{targetWeight} lbs</span></p>
          <p>Barbell: <span className="font-bold text-white">{barbellWeight} lbs</span></p>
        </div>
        <div className="mt-4 border-t border-gray-600 pt-4">
          <h5 className="text-lg font-semibold text-white mb-2">Plates Per Side:</h5>
          <ul className="space-y-2">
            {renderPlateList()}
          </ul>
          {/* --- NEW: Added instructional text for clarity --- */}
          {platesPerSide && platesPerSide.length > 0 && (
            <p className="text-xs text-gray-400 mt-3 text-center italic">
              Load this combination on each side of the bar.
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlateCalculatorModal;