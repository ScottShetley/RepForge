import React, {useState, useEffect} from 'react';

const AdjustWeightModal = ({isOpen, onClose, onSubmit, currentWeight}) => {
  const [newWeight, setNewWeight] = useState (currentWeight);

  useEffect (
    () => {
      setNewWeight (currentWeight);
    },
    [currentWeight, isOpen]
  );

  if (!isOpen) {
    return null;
  }

  const handleSubmit = e => {
    e.preventDefault ();
    const weightValue = parseFloat (newWeight);
    if (!isNaN (weightValue) && weightValue >= 0) {
      onSubmit (weightValue);
    }
    onClose ();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs rounded-lg bg-gray-800 p-6 shadow-xl"
        onClick={e => e.stopPropagation ()}
      >
        <h3 className="mb-4 text-center text-xl font-bold text-white">
          Adjust Weight
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={newWeight}
            onChange={e => setNewWeight (e.target.value)}
            className="w-full rounded-md border-gray-600 bg-gray-700 p-3 text-center text-2xl font-bold text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500"
            autoFocus
            onFocus={e => e.target.select ()}
          />
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-4 py-2 font-bold text-white transition-colors hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white transition-colors hover:bg-cyan-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustWeightModal;
