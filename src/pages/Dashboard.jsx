import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import WorkoutCalendar from '../components/dashboard/WorkoutCalendar';
import WorkoutModal from '../components/dashboard/WorkoutModal';
import { useAuth } from '../hooks/useAuth';
import { getWorkouts } from '../services/firebase';

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
        // Sort workouts by date, newest first
        userWorkouts.sort(
          (a, b) => b.createdAt.seconds - a.createdAt.seconds
        );
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

  const renderLastWorkoutSummary = () => {
    if (workouts.length === 0) return null;
    
    const lastWorkout = workouts[0]; // Since they are sorted newest first
    const lastWorkoutDate = new Date(lastWorkout.createdAt.seconds * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="p-4 bg-gray-900 rounded-lg text-center mb-6">
        <p className="text-gray-300">
          Your last session was{' '}
          <strong className="text-cyan-400">{lastWorkout.name}</strong> on{' '}
          <strong className="text-cyan-400">{lastWorkoutDate}</strong>.
        </p>
      </div>
    );
  };

  const renderHistoryList = () => {
    if (workouts.length === 0) {
      return (
        <p className="text-center text-gray-400">
          No workout sessions saved yet. Go to the 'New Workout' page to save your first session!
        </p>
      );
    }
    // We can display a limited list now that we have the calendar
    return (
      <div className="space-y-6">
        {workouts.slice(0, 5).map(workout => (
          <div
            key={workout.id}
            className="rounded-lg bg-gray-800 p-6 shadow-md hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => setSelectedWorkout(workout)}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-cyan-400">
                {workout.name}
              </h3>
              <span className="text-sm text-gray-400">
                {workout.createdAt
                  ? new Date(
                      workout.createdAt.seconds * 1000
                    ).toLocaleDateString()
                  : 'Date unavailable'}
              </span>
            </div>
            {/* We can hide the details here to keep the list clean */}
          </div>
        ))}
      </div>
    );
  };


  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-400">Loading history...</p>;
    }

    if (error) {
      return <p className="text-center text-red-400">{error}</p>;
    }

    return (
      <>
        {renderLastWorkoutSummary()}
        {/* --- FIX: Added a wrapper to control calendar size --- */}
        <div className="max-w-md mx-auto">
          <WorkoutCalendar workouts={workouts} onDateClick={setSelectedWorkout} />
        </div>
        <h3 className="text-2xl font-bold text-white mt-8 mb-4">Recent Workouts</h3>
        {renderHistoryList()}
      </>
    );
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <h2 className="mb-6 text-3xl font-bold text-white">Workout Dashboard</h2>
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