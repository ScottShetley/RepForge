import React from 'react';

const WorkoutModal = ({workout, onClose}) => {
  if (!workout) return null;

  const workoutDate = workout.createdAt
    ? new Date (workout.createdAt.seconds * 1000).toLocaleDateString ()
    : 'Date unavailable';

  const workoutTitle = workout.workoutType === 'circuit'
    ? 'Circuit Training'
    : workout.name;

  const renderWorkoutDetails = () => {
    if (workout.workoutType === 'circuit') {
      return (
        <div>
          <h4 className="mb-2 text-lg font-semibold text-cyan-300">
            Completed Exercises
          </h4>
          <ul className="space-y-2">
            {workout.exercises.map ((ex, index) => (
              <li
                key={index}
                className="flex justify-between border-b border-gray-700 py-1 text-gray-300"
              >
                <span>{ex.name}</span>
                <span className="font-mono">
                  {ex.reps} reps @ {ex.weight}lbs
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-lg font-semibold text-cyan-300">
            Core Lifts
          </h4>
          <ul className="space-y-2">
            {workout.exercises.map ((ex, index) => {
              // --- FIX: Calculate completed sets ---
              const completedSetsCount = ex.completedSets?.filter(Boolean).length || 0;
              return (
                <li
                  key={index}
                  className="flex justify-between border-b border-gray-700 py-1 text-gray-300"
                >
                  <span>{ex.name}</span>
                  {/* --- FIX: Display actual completed sets --- */}
                  <span className="font-mono">
                    {completedSetsCount}x{ex.reps} @ {ex.weight}lbs
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {workout.subSetWorkout &&
          workout.subSetWorkout.length > 0 &&
          <div>
            <h4 className="mb-2 text-lg font-semibold text-cyan-300">
              Subset Work
            </h4>
            <ul className="space-y-2">
              {workout.subSetWorkout.map ((subEx, subIndex) => {
                // --- FIX: Calculate completed sets for subsets too ---
                const completedSetsCount = subEx.completedSets?.filter(Boolean).length || 0;
                return (
                  <li
                    key={subIndex}
                    className="flex justify-between border-b border-gray-700 py-1 text-gray-300"
                  >
                    <span>{subEx.name}</span>
                    {/* --- FIX: Display actual completed sets for subsets --- */}
                    <span className="font-mono">
                      {completedSetsCount}x{subEx.reps} @ {subEx.weight || '0'}lbs
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>}
      </div>
    );
  };

  return (
    // Overlay: Now has padding to ensure the modal never touches the screen edges
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      {/* Main Card: Converted to a flex column with a max height. */}
      <div
        className="flex h-full max-h-full w-full max-w-md flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl"
        onClick={e => e.stopPropagation ()}
      >
        {/* Header: Stable, non-shrinking header with padding */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-700 p-4 sm:p-6">
          <h3 className="text-2xl font-bold text-cyan-400">{workoutTitle}</h3>
          <span className="text-sm text-gray-400">{workoutDate}</span>
        </div>

        {/* Scrolling Content Area: Grows to fill space and scrolls if content overflows */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6">
          {renderWorkoutDetails ()}
        </div>

        {/* Footer: Stable, non-shrinking footer with padding */}
        <div className="flex-shrink-0 border-t border-gray-700 p-4 text-right sm:p-6">
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-base font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;