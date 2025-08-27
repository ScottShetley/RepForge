import React from 'react';
import SetLogger from './SetLogger';
import WeightStepper from './WeightStepper';

// --- NEW: LockIcon for consistency ---
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      fillRule="evenodd"
      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
      clipRule="evenodd"
    />
  </svg>
);

const SubSetWorkout = ({
  exercises,
  onSetToggle,
  onWeightChange,
  onIncrement,
  onDecrement,
  isComplete, // --- ADD: Receive isComplete prop ---
  onLockIn, // --- ADD: Receive onLockIn prop ---
}) => {
  return (
    <div className="mt-8">
      <h3 className="mb-4 text-2xl font-bold text-gray-300">
        Subset Workout
      </h3>
      <div className="space-y-4 rounded-lg bg-gray-700/50 p-4">
        {exercises.map ((exercise, exerciseIndex) => {
          // --- NEW: Determine if controls should be disabled ---
          const isDisabled = isComplete || exercise.isLocked;

          return (
            <div
              key={exercise.id}
              className={`p-3 rounded-lg transition-all duration-300 ${exercise.isLocked ? 'bg-gray-800/50' : ''}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-white">{exercise.name}</p>
                  <p className="text-sm text-gray-400">
                    {exercise.sets}x{exercise.reps}
                  </p>
                </div>

                <WeightStepper
                  value={exercise.weight}
                  onIncrement={() => onIncrement (exerciseIndex)}
                  onDecrement={() => onDecrement (exerciseIndex)}
                  onWeightChange={value =>
                    onWeightChange (exerciseIndex, value)}
                  // --- NEW: Pass disabled state ---
                  disabled={isDisabled}
                />
              </div>
              <div className="mt-3">
                <SetLogger
                  totalSets={parseInt (exercise.sets, 10)}
                  completedSets={exercise.completedSets}
                  onSetToggle={setIndex =>
                    onSetToggle (exerciseIndex, setIndex)}
                  // --- NEW: Pass disabled state ---
                  isComplete={isDisabled}
                />
              </div>
              {/* --- NEW: "Lock it in" button and "Locked In" badge --- */}
              <div className="mt-4 flex items-center justify-end">
                {exercise.isLocked
                  ? <div className="flex items-center rounded-full bg-green-500/20 px-4 py-2 text-sm font-bold text-green-400">
                      <LockIcon />
                      Locked In
                    </div>
                  : <button
                      onClick={() => onLockIn (exerciseIndex)}
                      disabled={isComplete}
                      className="rounded-lg bg-cyan-600/70 py-2 px-4 text-sm font-bold text-white hover:bg-cyan-500/70 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      Lock it in
                    </button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubSetWorkout;
