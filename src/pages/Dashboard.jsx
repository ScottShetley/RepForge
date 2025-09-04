import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import WorkoutCalendar from '../components/dashboard/WorkoutCalendar';
import WorkoutModal from '../components/dashboard/WorkoutModal';
import { useAuth } from '../hooks/useAuth';
import {
  getWorkouts,
  deleteWorkout,
  getUserProgress,
  getLastWorkout,
} from '../services/firebase';
import ProgressCharts from '../components/dashboard/ProgressCharts';
import RecentWorkouts from '../components/dashboard/RecentWorkouts'; // New Import

const Dashboard = () => {
  const [workouts, setWorkouts] = useState ([]);
  const [loading, setLoading] = useState (true);
  const [error, setError] = useState ('');
  const {currentUser} = useAuth ();
  const [selectedWorkout, setSelectedWorkout] = useState (null);

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

  const handleDeleteWorkout = async workoutId => {
    if (!window.confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteWorkout (currentUser.uid, workoutId); // Updated to pass UID
      const userWorkouts = await getWorkouts (currentUser.uid);
      setWorkouts (userWorkouts);
    } catch (error) {
      setError('Failed to delete workout. Please try again.');
      console.error('Error deleting workout:', error);
    }
  };

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
    if (workouts.length === 0 && !loading) {
      return (
        <div className="py-8 text-center text-gray-400">
          <p>You haven't logged any workouts yet.</p>
          <p className="mt-2">Click "+ New Workout" to get started!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* -- Top Row -- */}
        <div className="lg:col-span-2">
          <WorkoutCalendar
            workouts={workouts}
            onDateClick={setSelectedWorkout}
            heatmapDates={highlightedDates}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentWorkouts
            workouts={workouts.slice (0, 3)}
            onSelect={setSelectedWorkout}
            onDelete={handleDeleteWorkout}
          />
        </div>

        {/* -- Bottom Row -- */}
        <div className="lg:col-span-3">
          <h3 className="mb-4 text-2xl font-bold text-white">
            Strength Progression
          </h3>
          <ProgressCharts workouts={workouts} />
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-3xl font-bold text-white">Workout Dashboard</h2>
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
        onClose={() => setSelectedWorkout (null)}
        onDelete={handleDeleteWorkout} // Pass delete handler to modal
      />
    </MainLayout>
  );
};

export default Dashboard;