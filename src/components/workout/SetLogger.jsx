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
    // --- FIX: Use justify-between for a more fluid layout and remove fixed gap ---
    (
      <div className="flex w-full items-center justify-between pt-2">
        {sets.map (setIndex => {
          const isCompleted = completedSets[setIndex];
          const isTimerActiveForThisSet = activeTimerSet === setIndex;

          // --- FIX: More aggressive responsive sizing. Mobile-first approach. ---
          const baseStyle =
            'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-lg font-semibold transition-colors duration-200';

          if (isTimerActiveForThisSet) {
            return (
              <div
                key={setIndex}
                className={`${baseStyle} bg-gray-900 w-auto px-0 md:px-2`}
              >
                <RestTimer onTimerComplete={() => onTimerComplete (setIndex)} />
              </div>
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
    )
  );
};

export default SetLogger;
