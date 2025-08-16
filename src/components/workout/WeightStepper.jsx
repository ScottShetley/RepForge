import React from 'react';

const WeightStepper = ({value, onIncrement, onDecrement, onWeightChange}) => {
  const handleInputChange = e => {
    // Allow direct typing, pass the raw value up
    onWeightChange (e.target.value);
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={onDecrement}
        className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-600 font-bold text-white transition hover:bg-gray-500"
        aria-label="Decrement weight"
      >
        -
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="w-20 rounded-md border-gray-600 bg-gray-800 p-2 text-center text-lg font-bold text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500"
        placeholder="lbs"
      />

      <button
        onClick={onIncrement}
        className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-600 font-bold text-white transition hover:bg-gray-500"
        aria-label="Increment weight"
      >
        +
      </button>
    </div>
  );
};

export default WeightStepper;
