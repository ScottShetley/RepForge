import React from 'react';
import RestTimer from './RestTimer';

const SetLogger = ({
  totalSets,
  completedSets,
  onSetToggle,
  isComplete,
  activeTimerSet,
  onTimerStart,
  onTimerComplete,
}) => {
  const setsCount = Number (totalSets) || 0;
  const sets = Array.from ({length: setsCount}, (_, i) => i);

  return (
    // --- FIX: Remove flex-wrap, adjust gap and justification for responsiveness ---
    (
      <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 pt-2">
        {sets.map (setIndex => {
          const isCompleted = completedSets[setIndex];
          const isTimerActiveForThisSet = activeTimerSet === setIndex;

          // --- FIX: Make base style responsive. Smaller on mobile, larger on sm+ screens ---
          const baseStyle =
            'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-semibold transition-colors duration-200';

          if (isTimerActiveForThisSet) {
            return (
              // --- FIX: Make timer container responsive ---
              (
                <div
                  key={setIndex}
                  className={`${baseStyle} bg-gray-900 w-auto px-1 sm:px-2`}
                >
                  <RestTimer
                    onTimerComplete={() => onTimerComplete (setIndex)}
                  />
                </div>
              )
            );
          }

          const completedStyle = 'bg-cyan-500 text-white cursor-pointer';
          const incompleteStyle =
            'bg-gray-600 hover:bg-cyan-500 cursor-pointer';
          const disabledStyle = 'bg-gray-500 cursor-not-allowed';

          let style = isCompleted ? completedStyle : incompleteStyle;
          if (isComplete) style = disabledStyle;

          const handleClick = () => {
            if (!isComplete) {
              onSetToggle (setIndex);
              if (!isCompleted) {
                onTimerStart (setIndex);
              }
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
                    // --- FIX: Make checkmark icon responsive ---
                    className="h-5 w-5 sm:h-6 sm:w-6"
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
    )
  );
};

export default SetLogger;
