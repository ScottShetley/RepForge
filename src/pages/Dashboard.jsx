import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import MainLayout from '../components/layout/MainLayout';
import WorkoutCalendar from '../components/dashboard/WorkoutCalendar';
import WorkoutModal from '../components/dashboard/WorkoutModal';
import { useAuth } from '../hooks/useAuth';
import { getWorkouts, deleteWorkout } from '../services/firebase';
import ProgressCharts from '../components/dashboard/ProgressCharts';
import RecentWorkouts from '../components/dashboard/RecentWorkouts';
import CircuitPerformance from '../components/dashboard/CircuitPerformance';

const LOCAL_STORAGE_KEY = 'inProgressRepForgeWorkout'; // Key for local storage

const Dashboard = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [inProgressWorkout, setInProgressWorkout] = useState(null); // State for saved session
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Check for a workout in progress when the component loads
    const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSession) {
      setInProgressWorkout(JSON.parse(savedSession));
    }

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

  const handleDeleteWorkout = async (workoutId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this workout? This action cannot be undone.'
      )
    ) {
      return;
    }
    try {
      await deleteWorkout(workoutId);
      setWorkouts((prevWorkouts) =>
        prevWorkouts.filter((w) => w.docId !== workoutId)
      );
    } catch (error) {
      setError('Failed to delete workout. Please try again.');
      console.error('Error deleting workout:', error);
    }
  };
  
  // Handler to resume the workout
  const handleResumeWorkout = () => {
    if (inProgressWorkout) {
        navigate('/workout', { state: { workoutId: inProgressWorkout.workoutId } });
    }
  };

  const highlightedDates = workouts.map((w) =>
    new Date(w.createdAt.seconds * 1000).toDateString()
  );

  const renderContent = () => {
    if (loading)
      return <p className="text-center text-gray-400">Loading history...</p>;
    if (error) return <p className="text-center text-red-400">{error}</p>;
    if (workouts.length === 0 && !loading && !inProgressWorkout) { // Also check for in-progress
      return (
        <div className="py-8 text-center text-gray-400">
          <p>You haven't logged any workouts yet.</p>
          <p className="mt-2">Click "+ New Workout" to get started!</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WorkoutCalendar
              workouts={workouts}
              onDateClick={setSelectedWorkout}
              heatmapDates={highlightedDates}
            />
          </div>
          <div className="lg:col-span-1">
            <RecentWorkouts
              workouts={workouts.slice(0, 3)}
              onSelect={setSelectedWorkout}
              onDelete={handleDeleteWorkout}
            />
          </div>
        </div>
        <div className="space-y-6">
          <ProgressCharts workouts={workouts} />
          <CircuitPerformance workouts={workouts} />
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

        {/* --- ADDED: Resume Workout Banner --- */}
        {inProgressWorkout && (
            <div className="mb-6 rounded-lg bg-cyan-800/50 border border-cyan-500 p-4 text-center">
                <p className="font-bold text-white">You have a workout in progress!</p>
                <button
                    onClick={handleResumeWorkout}
                    className="mt-2 rounded-md bg-cyan-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-cyan-600"
                >
                    Resume Workout {inProgressWorkout.workoutId === 'workoutA' ? 'A' : 'B'}
                </button>
            </div>
        )}

        {renderContent()}
      </div>
      <WorkoutModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onDelete={handleDeleteWorkout}
      />
    </MainLayout>
  );
};

export default Dashboard;