import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import WorkoutCalendar from '../components/dashboard/WorkoutCalendar';
import WorkoutModal from '../components/dashboard/WorkoutModal';
import { useAuth } from '../hooks/useAuth';
import { getWorkouts, deleteWorkout } from '../services/firebase';
import ProgressCharts from '../components/dashboard/ProgressCharts';

const Dashboard = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userWorkouts = await getWorkouts(currentUser.uid);
        setWorkouts(userWorkouts);
      } catch (err) {
        setError('Failed to load workout history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [currentUser]);

  const handleDeleteWorkout = async workoutId => {
    if (
      !window.confirm(
        'Are you sure you want to delete this workout? This action cannot be undone.'
      )
    ) {
      return;
    }
    try {
      await deleteWorkout(workoutId);
      // Re-fetch workouts after deletion
      const userWorkouts = await getWorkouts(currentUser.uid);
      setWorkouts(userWorkouts);
    } catch (error) {
      setError('Failed to delete workout. Please try again.');
      console.error('Error deleting workout:', error);
    }
  };

  const renderHistoryList = () => {
    if (workouts.length === 0) {
      return (
        <div className="py-8 text-center text-gray-400">
          <p>You haven't logged any workouts yet.</p>
          <p className="mt-2">Click "New Workout" to get started!</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {workouts.slice(0, 5).map(workout => {
          const workoutName =
            workout.workoutType === 'circuit' ? 'Circuit Training' : workout.name;

          return (
            <div
              key={workout.docId}
              className="relative rounded-lg bg-gray-800 p-6 shadow-md transition-colors"
            >
              <div
                className="cursor-pointer"
                onClick={() => setSelectedWorkout(workout)}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-cyan-400">
                    {workoutName}
                    {workout.containsNewPR && (
                      <span
                        className="ml-2 text-xl"
                        title="New Personal Record!"
                        role="img"
                        aria-label="personal record medal"
                      >
                        🥇
                      </span>
                    )}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {workout.createdAt
                      ? new Date(
                          workout.createdAt.seconds * 1000
                        ).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'Date unavailable'}
                  </span>
                </div>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteWorkout(workout.docId);
                }}
                className="absolute top-2 right-2 text-xs font-bold text-gray-500 transition-colors hover:text-red-500"
                aria-label="Delete workout"
              >
                DELETE
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // --- FIX: Create an array of date STRINGS for comparison ---
  const highlightedDates = workouts.map(w =>
    new Date(w.createdAt.seconds * 1000).toDateString()
  );

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-400">Loading history...</p>;
    }
    if (error) {
      return <p className="text-center text-red-400">{error}</p>;
    }
    return (
      <>
        <div className="mb-8">
          <h3 className="mb-4 text-2xl font-bold text-white">
            Strength Progression
          </h3>
          <ProgressCharts />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mx-auto max-w-md md:col-span-2">
            <WorkoutCalendar
              workouts={workouts}
              onDateClick={setSelectedWorkout}
              heatmapDates={highlightedDates}
            />
          </div>
        </div>

        <h3 className="mt-8 mb-4 text-2xl font-bold text-white">
          Recent Workouts
        </h3>
        {renderHistoryList()}
      </>
    );
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-3xl font-bold text-white">
            Workout Dashboard
          </h2>
          <Link
            to="/select-workout"
            className="font-bold text-cyan-400 hover:text-cyan-300"
          >
            + New Workout
          </Link>
        </div>

        {renderContent()}
      </div>

      <WorkoutModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />
    </MainLayout>
  );
};

export default Dashboard;