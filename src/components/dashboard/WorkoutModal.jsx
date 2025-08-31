import React from 'react';

const WorkoutModal = ({ workout, onClose }) => {
  if (!workout) return null;

  const workoutDate = workout.createdAt
    ? new Date(workout.createdAt.seconds * 1000).toLocaleDateString()
    : 'Date unavailable';

  const workoutTitle = workout.workoutType === 'circuit' ? 'Circuit Training' : workout.name;

  const renderWorkoutDetails = () => {
    if (workout.workoutType === 'circuit') {
      const completedExercises = workout.exercises?.filter(ex => ex.completedSets > 0) || [];
      if (completedExercises.length === 0) {
        return <p className="text-gray-400">No exercises were completed in this session.</p>;
      }
      return (
        <div>
          <h4 className="mb-2 text-lg font-semibold text-cyan-300">
            Completed Exercises
          </h4>
          <ul className="space-y-2">
            {completedExercises.map((ex, index) => (
              <li
                key={index}
                className="flex justify-between border-b border-gray-700 py-1 text-gray-300"
              >
                <span>{ex.name}</span>
                <span className="font-mono">
                  {ex.completedSets || 0}/3 sets @ {ex.weight || 0}lbs
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Logic for '5x5' workouts
    const completedCoreLifts = workout.exercises?.filter(ex => {
      if (Array.isArray(ex.sets)) {
        return ex.sets.some(set => set.reps > 0);
      }
      return false;
    }) || [];

    const completedSubsets = workout.subSetWorkout?.filter(ex => {
       if (Array.isArray(ex.sets)) {
        return ex.weight > 0 && ex.sets.some(set => set.reps > 0);
      }
      return false;
    }) || [];

    return (
      <div className="space-y-4">
        {completedCoreLifts.length > 0 && (
          <div>
            <h4 className="mb-2 text-lg font-semibold text-cyan-300">Core Lifts</h4>
            <ul className="space-y-2">
              {completedCoreLifts.map((ex, index) => {
                const completedSetsCount = ex.sets.filter(s => s.reps >= s.targetReps).length;
                return (
                  <li key={index} className="flex justify-between border-b border-gray-700 py-1 text-gray-300">
                    <span>{ex.name}</span>
                    <span className="font-mono">
                      {completedSetsCount}/{ex.sets.length} sets @ {ex.weight}lbs
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {completedSubsets.length > 0 && (
          <div>
            <h4 className="mb-2 text-lg font-semibold text-cyan-300">Subset Work</h4>
            <ul className="space-y-2">
              {completedSubsets.map((subEx, subIndex) => {
                const completedSetsCount = subEx.sets.filter(s => s.reps > 0).length;
                return (
                  <li key={subIndex} className="flex justify-between border-b border-gray-700 py-1 text-gray-300">
                    <span>{subEx.name}</span>
                    <span className="font-mono">
                      {completedSetsCount}/{subEx.sets.length} sets @ {subEx.weight || '0'}lbs
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-700 p-4 sm:p-6">
          <h3 className="text-2xl font-bold text-cyan-400">{workoutTitle}</h3>
          <span className="text-sm text-gray-400">{workoutDate}</span>
        </div>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6">
          {renderWorkoutDetails()}
        </div>

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