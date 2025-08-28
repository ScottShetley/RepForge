import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import WorkoutCalendar from '../components/dashboard/WorkoutCalendar';
import WorkoutModal from '../components/dashboard/WorkoutModal';
import { useAuth } from '../hooks/useAuth';
import { getWorkouts, deleteWorkout } from '../services/firebase';
import { calculatePRs, calculateMonthlyStats, calculateStreakAndHeatmap } from '../utils/calculations';
import PRTracker from '../components/dashboard/PRTracker';
import SummaryStats from '../components/dashboard/SummaryStats';

const Dashboard = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [personalRecords, setPersonalRecords] = useState({});
  const [summaryStats, setSummaryStats] = useState({ workoutsThisMonth: 0, totalVolume: 0 });
  // --- NEW: State for streak and heatmap data ---
  const [streakData, setStreakData] = useState({ streak: 0, heatmapDates: [] });

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

        const prData = calculatePRs(userWorkouts);
        setPersonalRecords(prData);
        
        const monthlyStats = calculateMonthlyStats(userWorkouts);
        setSummaryStats(monthlyStats);

        // --- NEW: Calculate streak and heatmap data ---
        const newStreakData = calculateStreakAndHeatmap(userWorkouts);
        setStreakData(newStreakData);

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
      // Update state to remove workout from UI immediately
      const updatedWorkouts = workouts.filter(w => w.docId !== workoutId)
      setWorkouts(updatedWorkouts); 
    } catch (error) {
      setError('Failed to delete workout. Please try again.');
      console.error('Error deleting workout:', error);
    }
  };

  const renderLastWorkoutSummary = () => {
    if (workouts.length === 0) return null; 

    const lastWorkout = workouts[0]; 
    const lastWorkoutDate = new Date(
      lastWorkout.createdAt.seconds * 1000
    ).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }); 

    const workoutName =
      lastWorkout.workoutType === 'circuit'
        ? 'Circuit Training'
        : lastWorkout.name; 

    return (
      <div className="p-4 bg-gray-900 rounded-lg text-center mb-6">
        <p className="text-gray-300">
          Your last session was{' '}
          <strong className="text-cyan-400">{workoutName}</strong> on{' '}
          <strong className="text-cyan-400">{lastWorkoutDate}</strong>.
        </p>
      </div>
    );
  };

  const renderHistoryList = () => {
    if (workouts.length === 0) { 
      return (
        <p className="text-center text-gray-400">
          You haven't logged any workouts yet.
        </p>
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
              className="rounded-lg bg-gray-800 p-6 shadow-md transition-colors relative"
            >
              <div
                className="cursor-pointer"
                onClick={() => setSelectedWorkout(workout)}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-cyan-400">
                    {workoutName}
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
                  e.stopPropagation(); // Prevent modal from opening
                  handleDeleteWorkout(workout.docId);
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors text-xs font-bold"
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
        <div className="max-w-md mx-auto">
          {/* --- MODIFIED: Pass heatmapDates prop to calendar --- */}
          <WorkoutCalendar
            workouts={workouts}
            onDateClick={setSelectedWorkout}
            heatmapDates={streakData.heatmapDates}
          />
        </div>
        <h3 className="text-2xl font-bold text-white mt-8 mb-4">
          Recent Workouts
        </h3>
        {renderHistoryList()}
      </>
    );
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <h2 className="mb-6 text-3xl font-bold text-white">
          Workout Dashboard
        </h2>

        {/* --- MODIFIED: Pass streak prop to SummaryStats --- */}
        <div className="mb-8">
          <SummaryStats stats={summaryStats} streak={streakData.streak} />
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/workout"
            className="block w-full text-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
          >
            Start RepForge Workout
          </Link>
          <Link
            to="/circuit-tracker"
            className="block w-full text-center bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
          >
            Start Circuit Workout
          </Link>
        </div>

        <div className="mb-8">
          <PRTracker prs={personalRecords} />
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