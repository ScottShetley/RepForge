import React from 'react';

const BadgeIcon = ({ badge }) => {
  switch (badge) {
    case 'gold': return <span title="Gold Badge!">🥇</span>;
    case 'silver': return <span title="Silver Badge!">🥈</span>;
    case 'bronze': return <span title="Bronze Badge!">🥉</span>;
    default: return null;
  }
};

const WorkoutModal = ({ workout, onClose }) => {
  if (!workout) return null;

  const workoutDate = workout.createdAt
    ? new Date(workout.createdAt.seconds * 1000).toLocaleDateString()
    : 'Date unavailable';

  const workoutTitle = workout.workoutType === 'circuit' ? 'Circuit Training' : workout.name;

  const renderProgressionStatus = (exercise) => {
    if (!exercise.progressionStatus) return null;
    switch (exercise.progressionStatus) {
      case 'successful':
        return (
          <span className="mt-1 block text-xs font-medium text-green-400">
            Progression: +{exercise.increment || 5}lbs
          </span>
        );
      case 'failed':
        return (
          <span className="mt-1 block text-xs font-medium text-yellow-400">
            Status: Failed
          </span>
        );
      case 'skipped':
        return (
          <span className="mt-1 block text-xs font-medium text-gray-500">
            Status: Skipped
          </span>
        );
      default:
        return null;
    }
  };

  const renderWorkoutDetails = () => {
    if (workout.workoutType === 'circuit') {
      // --- FIX #1: Correctly displays completed exercises for circuits ---
      const completedExercises = workout.exercises?.slice(0, workout.exercisesCompleted) || [];

      return (
        <div className="space-y-6">
          {/* -- Performance Summary -- */}
          <div>
            <h4 className="mb-3 text-lg font-bold text-white">Performance Summary</h4>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-900 p-4">
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="text-xl font-semibold text-white">{workout.timeTaken || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Exercises Completed</p>
                <p className="text-xl font-semibold text-white">
                  {workout.exercisesCompleted} / {workout.exercises?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* -- Completed Exercises -- */}
          <div>
            <h4 className="mb-3 text-lg font-bold text-white">Completed Exercises</h4>
            <div className="space-y-3">
              {completedExercises.length > 0 ? (
                completedExercises.map((ex, index) => (
                  <div key={index} className="rounded-md bg-gray-900 p-3">
                    <p className="font-semibold text-white">{ex.name}</p>
                    <p className="text-sm text-gray-400">Weight: {ex.weight}lbs</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No exercises were locked in for this session.</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // --- Renders StrongLifts 5x5 Details ---
    return (
      <div className="space-y-4">
        {workout.exercises?.map((exercise, index) => (
          <div key={index} className="rounded-lg bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white">{exercise.name}</h4>
              {exercise.isNewPR && <span title="New Personal Record!">🥇</span>}
            </div>
            <p className="text-md text-gray-300">Weight: {exercise.weight}lbs</p>
            {/* --- FIX #2: Correctly maps over the sets object array --- */}
            <p className="text-sm text-gray-400">
              Sets: {exercise.sets.map(set => set.reps).join(', ')}
            </p>
            {renderProgressionStatus(exercise)}
          </div>
        ))}
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
        <div className="flex-shrink-0 border-b border-gray-700 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-cyan-400">{workoutTitle}</h3>
              <span className="text-sm text-gray-400">{workoutDate}</span>
            </div>
            <div className="flex items-center gap-3 text-xl">
              {workout.workoutType === 'circuit' && (
                <>
                  <BadgeIcon badge={workout.timeBadge} />
                  <BadgeIcon badge={workout.exerciseBadge} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6">
          {renderWorkoutDetails()}
        </div>

        <div className="flex-shrink-0 border-t border-gray-700 p-4 text-right sm:p-6">
          <button
            onClick={onClose}
            className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;