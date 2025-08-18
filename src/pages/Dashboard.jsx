import React, {useState, useEffect} from 'react';
import MainLayout from '../components/layout/MainLayout';
import {useAuth} from '../hooks/useAuth';
import {getWorkouts} from '../services/firebase';

const Dashboard = () => {
  const [workouts, setWorkouts] = useState ([]);
  const [loading, setLoading] = useState (true);
  const [error, setError] = useState ('');
  const {currentUser} = useAuth ();

  useEffect (
    () => {
      const fetchWorkouts = async () => {
        if (!currentUser) {
          setLoading (false);
          return;
        }

        try {
          setLoading (true);
          const userWorkouts = await getWorkouts (currentUser.uid);
          // Sort workouts by date, newest first
          userWorkouts.sort (
            (a, b) => b.createdAt.seconds - a.createdAt.seconds
          );
          setWorkouts (userWorkouts);
        } catch (err) {
          setError ('Failed to load workout history.');
          console.error (err);
        } finally {
          setLoading (false);
        }
      };

      fetchWorkouts ();
    },
    [currentUser]
  );

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-400">Loading history...</p>;
    }

    if (error) {
      return <p className="text-center text-red-400">{error}</p>;
    }

    if (workouts.length === 0) {
      return (
        <p className="text-center text-gray-400">
          No workout sessions saved yet. Go to the 'New Workout' page to save your first session!
        </p>
      );
    }

    return (
      <div className="space-y-6">
        {workouts.map (workout => (
          <div
            key={workout.id}
            className="rounded-lg bg-gray-800 p-6 shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-cyan-400">
                {workout.name}
              </h3>
              <span className="text-sm text-gray-400">
                {workout.createdAt
                  ? new Date (
                      workout.createdAt.seconds * 1000
                    ).toLocaleDateString ()
                  : 'Date unavailable'}
              </span>
            </div>
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

            {/* --- NEW: Subset Workout Display --- */}
            {workout.subSetWorkout &&
              workout.subSetWorkout.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
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
                </div>
              )}
            {/* --- END: Subset Workout Display --- */}

          </div>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <h2 className="mb-6 text-3xl font-bold text-white">Workout History</h2>
        {renderContent ()}
      </div>
    </MainLayout>
  );
};

export default Dashboard;