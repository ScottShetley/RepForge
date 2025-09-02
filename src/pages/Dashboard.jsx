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
import RecentWorkouts from '../components/dashboard/RecentWorkouts';
import UpNextWorkout from '../components/dashboard/UpNextWorkout';

const workoutTemplates = {
  workoutA: {
    id: 'workoutA',
    name: 'Workout A',
    coreLifts: [
      { exerciseId: 'squat', name: 'Squat', sets: 5, reps: 5 },
      { exerciseId: 'bench-press', name: 'Bench Press', sets: 5, reps: 5 },
      { exerciseId: 'seated-cable-row', name: 'Seated Cable Row', sets: 5, reps: 5 },
    ],
  },
  workoutB: {
    id: 'workoutB',
    name: 'Workout B',
    coreLifts: [
      { exerciseId: 'squat', name: 'Squat', sets: 5, reps: 5 },
      { exerciseId: 'overhead-press', name: 'Overhead Press', sets: 5, reps: 5 },
      { exerciseId: 'deadlift', name: 'Deadlift', sets: 1, reps: 5 },
    ],
  },
};

const Dashboard = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [upNextData, setUpNextData] = useState({ loading: true, workout: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [userWorkouts, lastWorkout, progress] = await Promise.all([
          getWorkouts(currentUser.uid),
          getLastWorkout(currentUser.uid),
          getUserProgress(currentUser.uid),
        ]);

        setWorkouts(userWorkouts);

        if (progress) {
          const nextWorkoutId = !lastWorkout || lastWorkout.id === 'workoutB' ? 'workoutA' : 'workoutB';
          const template = workoutTemplates[nextWorkoutId];
          
          const upNextExercises = template.coreLifts.map(lift => {
            const progressData = progress[lift.exerciseId];
            return {
              ...lift,
              weight: progressData?.currentWeight || 45,
            };
          });

          setUpNextData({
            loading: false,
            workout: { ...template, exercises: upNextExercises },
          });
        } else {
            setUpNextData({ loading: false, workout: null });
        }

      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);
  
  const handleStartWorkout = (workoutId) => {
    navigate('/workout', { state: { workoutId } });
  };

  const handleDeleteWorkout = async workoutId => {
    if (!window.confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteWorkout(currentUser.uid, workoutId);
      const userWorkouts = await getWorkouts(currentUser.uid);
      setWorkouts(userWorkouts);
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
      return <p className="text-center text-gray-400">Loading dashboard...</p>;
    }
    if (error) {
      return <p className="text-center text-red-400">{error}</p>;
    }
    
    const upNextComponent = !upNextData.loading && upNextData.workout && (
      <UpNextWorkout
        workout={upNextData.workout}
        onStartWorkout={handleStartWorkout}
      />
    );

    if (workouts.length === 0 && !loading && !upNextData.loading) {
      return (
        <div className="py-8 text-center text-gray-400">
          <p>You haven't logged any workouts yet.</p>
          <p className="mt-2">Click "+ New Workout" to get started!</p>
        </div>
      );
    }

    return (
      <div>
        {/* --- Mobile Only: "Up Next" card at the top --- */}
        <div className="mb-6 lg:hidden">
            {upNextComponent}
        </div>

        {/* --- Main Grid for all screen sizes --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* --- Left Column --- */}
            <div className="lg:col-span-2 space-y-6">
                <div className="rounded-lg bg-gray-800 p-2">
                    <WorkoutCalendar
                        workouts={workouts}
                        onDateClick={setSelectedWorkout}
                        heatmapDates={highlightedDates}
                    />
                </div>
                <div>
                    <h3 className="mb-4 text-2xl font-bold text-white">
                        Strength Progression
                    </h3>
                    <ProgressCharts workouts={workouts} />
                </div>
            </div>

            {/* --- Right Column --- */}
            <div className="lg:col-span-1 space-y-6">
                {/* --- Desktop Only: "Up Next" card --- */}
                <div className="hidden lg:block">
                    {upNextComponent}
                </div>
                <RecentWorkouts
                    workouts={workouts.slice(0, 3)}
                    onSelect={setSelectedWorkout}
                    onDelete={handleDeleteWorkout}
                />
            </div>
        </div>
      </div>
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
        onDelete={handleDeleteWorkout}
      />
    </MainLayout>
  );
};

export default Dashboard;