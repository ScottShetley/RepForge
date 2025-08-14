import React from 'react';
import ExerciseDisplay from './ExerciseDisplay';

const WorkoutView = ({workout}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6 text-cyan-400">
        {workout.name}
      </h2>
      <div className="space-y-4">
        {workout.exercises.map (exercise => (
          <ExerciseDisplay key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
};

export default WorkoutView;
