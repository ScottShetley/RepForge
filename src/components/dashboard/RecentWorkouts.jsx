import React from 'react';

const RecentWorkouts = ({workouts, onSelect, onDelete}) => {
  return (
    <div className="flex h-full flex-col rounded-lg bg-gray-700 p-4 shadow-md">
      <h3 className="mb-4 text-xl font-bold text-white">Recent Activity</h3>
      {workouts.length > 0
        ? <div className="space-y-3">
            {workouts.map (workout => {
              const workoutName = workout.workoutType === 'circuit'
                ? 'Circuit Training'
                : workout.name;

              return (
                <div
                  key={workout.docId}
                  className="relative rounded-lg bg-gray-800 p-3 shadow-sm"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => onSelect (workout)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-cyan-400">
                        {workoutName}
                        {workout.containsNewPR &&
                          <span
                            className="ml-2 text-sm"
                            title="New Personal Record!"
                          >
                            🥇
                          </span>}
                        {workout.metTimeGoal &&
                          <span
                            className="ml-2 text-sm"
                            title="Completed under 30 minutes!"
                          >
                            🏆
                          </span>}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date (
                        workout.createdAt.seconds * 1000
                      ).toLocaleDateString ()}
                    </p>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation ();
                      onDelete (workout.docId);
                    }}
                    className="absolute top-1 right-1 p-1 text-xs font-bold text-gray-500 transition-colors hover:text-red-500"
                    aria-label={`Delete ${workoutName} workout`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        : <div className="flex-grow text-center text-sm text-gray-400">
            <p>Your recent workouts will appear here.</p>
          </div>}
    </div>
  );
};

export default RecentWorkouts;
