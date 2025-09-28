import React from 'react';

const SetLogger = ({ sets, onSetToggle, isComplete }) => {
  const setsCount = sets.length;

  return (
    <div className="flex w-full items-center justify-between pt-2">
      {Array.from({ length: setsCount }, (_, i) => i).map(setIndex => {
        const set = sets[setIndex];
        // --- DEFINITIVE FIX: Use the 'completed' boolean from the parent state ---
        const isCompleted = set.completed;

        const baseStyle =
          'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-lg font-semibold transition-colors duration-200';

        const completedStyle = 'bg-cyan-500 text-white cursor-pointer';
        const incompleteStyle = 'bg-gray-600 hover:bg-cyan-500 cursor-pointer';
        const disabledStyle = 'bg-gray-500 cursor-not-allowed';

        let style = isCompleted ? completedStyle : incompleteStyle;
        if (isComplete) style = disabledStyle;

        const handleClick = () => {
          if (!isComplete) {
            onSetToggle(setIndex);
          }
        };

        return (
          <div
            key={setIndex}
            className={`${baseStyle} ${style}`}
            onClick={handleClick}
          >
            {isCompleted
              ? <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-6 md:w-6"
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