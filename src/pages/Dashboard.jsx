import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import WorkoutView from '../components/workout/WorkoutView';

// Temporary mock data to simulate fetching a workout from Firestore
const mockWorkout = {
  id: 'workoutA',
  name: 'Workout A',
  exercises: [
    {id: 1, name: 'Squat', sets: 5, reps: 5, weight: 185},
    {id: 2, name: 'Bench Press', sets: 5, reps: 5, weight: 135},
    {id: 3, name: 'Barbell Row', sets: 5, reps: 5, weight: 115},
  ],
};

const Dashboard = () => {
  return (
    <MainLayout>
      <WorkoutView workout={mockWorkout} />
    </MainLayout>
  );
};

export default Dashboard;
