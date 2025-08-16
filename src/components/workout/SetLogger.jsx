import React from 'react';

const SetLogger = ({totalSets, completedSets, onSetToggle}) => {
  const setsCount = Number (totalSets) || 0;
  const sets = Array.from ({length: setsCount}, (_, i) => i); // Create an array of indices [0, 1, 2, ...]

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {sets.map (setIndex => {
        // The style is now determined by the prop passed from the parent
        const isCompleted = completedSets[setIndex];
        const baseStyle =
          'w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold cursor-pointer transition-colors duration-200';
        const completedStyle = 'bg-cyan-500 text-white';
        const incompleteStyle = 'bg-gray-600 hover:bg-cyan-500';

        return (
          <div
            key={setIndex}
            className={`${baseStyle} ${isCompleted ? completedStyle : incompleteStyle}`}
            // When clicked, it calls the function passed down from the parent
            onClick={() => onSetToggle (setIndex)}
          >
            {isCompleted
              ? <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              : setIndex + 1}
          </div>
        );
      })}
    </div>
  );
};

export default SetLogger;
