import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import WorkoutView from '../components/workout/WorkoutView';
import { useAuth } from '../hooks/useAuth';
import { getLastWorkout } from '../services/firebase';

const Workout = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [workoutId, setWorkoutId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This logic now lives here, in the parent.
    const determineWorkoutId = async () => {
      if (location.state?.workoutId) {
        setWorkoutId(location.state.workoutId);
        setLoading(false);
      } else if (currentUser) {
        // Fallback logic if the page is accessed directly.
        const lastWorkout = await getLastWorkout(currentUser.uid);
        const nextWorkout = lastWorkout?.name === 'Workout A' ? 'workoutB' : 'workoutA';
        setWorkoutId(nextWorkout);
        setLoading(false);
      }
    };

    if (currentUser !== undefined) {
       determineWorkoutId();
    }
  }, [currentUser, location.state]);

  if (loading) {
    return (
      <MainLayout>
        <p className="p-6 text-center text-gray-300">Determining workout...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Pass the finalized workoutId down as a prop */}
      <WorkoutView workoutId={workoutId} key={workoutId} />
    </MainLayout>
  );
};

export default Workout;