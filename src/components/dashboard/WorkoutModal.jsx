import React from 'react';

const WorkoutModal = ({workout, onClose}) => {
  if (!workout) return null;

  const workoutDate = workout.createdAt
    ? new Date (workout.createdAt.seconds * 1000).toLocaleDateString ()
    : 'Date unavailable';

  // Determine the title based on workout type
  const workoutTitle = workout.workoutType === 'circuit'
    ? 'Circuit Training'
    : workout.name;

  // Conditionally render the details based on workout type
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

    // Default rendering for 5x5 workouts
    return (
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-lg font-semibold text-cyan-300">
            Core Lifts
          </h4>
          <ul className="space-y-2">
            {workout.exercises.map ((ex, index) => (
              <li
                key={index}
                className="flex justify-between border-b border-gray-700 py-1 text-gray-300"
              >
                <span>{ex.name}</span>
                <span className="font-mono">
                  {ex.sets}x{ex.reps} @ {ex.weight}lbs
                </span>
              </li>
            ))}
          </ul>
        </div>

        {workout.subSetWorkout &&
          workout.subSetWorkout.length > 0 &&
          <div>
            <h4 className="mb-2 text-lg font-semibold text-cyan-300">
              Subset Work
            </h4>
            <ul className="space-y-2">
              {workout.subSetWorkout.map ((subEx, subIndex) => (
                <li
                  key={subIndex}
                  className="flex justify-between border-b border-gray-700 py-1 text-gray-300"
                >
                  <span>{subEx.name}</span>
                  <span className="font-mono">
                    {subEx.sets}x{subEx.reps} @ {subEx.weight || '0'}lbs
                  </span>
                </li>
              ))}
            </ul>
          </div>}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 border border-gray-700"
        onClick={e => e.stopPropagation ()} // Prevent closing when clicking inside the modal
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-cyan-400">{workoutTitle}</h3>
          <span className="text-sm text-gray-400">{workoutDate}</span>
        </div>

        {renderWorkoutDetails ()}

        <div className="mt-6 text-right">
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
