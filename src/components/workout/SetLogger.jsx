import React from 'react';

const SetLogger = ({totalSets}) => {
  // Ensure totalSets is a number, default to 0 if not.
  const setsCount = Number (totalSets) || 0;
  const sets = Array.from ({length: setsCount}, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {sets.map (set => (
        <div
          key={set}
          className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg font-semibold cursor-pointer hover:bg-cyan-500 transition-colors duration-200"
        >
          {/* We can add logic later to show a checkmark */}
        </div>
      ))}
    </div>
  );
};

export default SetLogger;
