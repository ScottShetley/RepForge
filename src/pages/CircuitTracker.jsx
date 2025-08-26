// File: src/pages/CircuitTracker.jsx

import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import CircuitView from '../components/workout/CircuitView';

const CircuitTracker = () => {
  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <h2 className="mb-6 text-3xl font-bold text-white">Circuit Tracker</h2>
        <p className="text-gray-400 mb-6">
          Select your weight and reps for each exercise. Your progress will be saved to your workout history.
        </p>
        <CircuitView />
      </div>
    </MainLayout>
  );
};

export default CircuitTracker;
