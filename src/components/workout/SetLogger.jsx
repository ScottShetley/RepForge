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
  const setsCount = Number(totalSets) || 0;
  const sets = Array.from({ length: setsCount }, (_, i) => i);

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {sets.map(setIndex => {
        const isCompleted = completedSets[setIndex];
        const isTimerActiveForThisSet = activeTimerSet === setIndex;

        const baseStyle =
          'w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-colors duration-200';
        
        // Timer takes precedence over checkmark
        if (isTimerActiveForThisSet) {
          return (
             <div key={setIndex} className={`${baseStyle} bg-gray-900 w-auto px-2`}>
                <RestTimer onTimerComplete={() => onTimerComplete(setIndex)} />
             </div>
          );
        }

        // Standard checkmark/number display
        const completedStyle = 'bg-cyan-500 text-white cursor-pointer';
        const incompleteStyle = 'bg-gray-600 hover:bg-cyan-500 cursor-pointer';
        const disabledStyle = 'bg-gray-500 cursor-not-allowed';

        let style = isCompleted ? completedStyle : incompleteStyle;
        if (isComplete) style = disabledStyle;
        
        const handleClick = () => {
          if (!isComplete) {
            onSetToggle(setIndex);
            // If we are marking a set as complete, start the timer prompt
            if (!isCompleted) {
              onTimerStart(setIndex);
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