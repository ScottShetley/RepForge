import React from 'react';
import SetLogger from './SetLogger';
import WeightStepper from './WeightStepper';

const SubSetWorkout = ({
  exercises,
  onSetToggle,
  onWeightChange,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="mt-8">
      <h3 className="mb-4 text-2xl font-bold text-gray-300">
        Subset Workout
      </h3>
      <div className="space-y-4 rounded-lg bg-gray-700/50 p-4">
        {exercises.map ((exercise, exerciseIndex) => (
          <div key={exercise.id}>
            {/* --- MODIFICATION START --- */}
            {/* Replaced rigid grid with a responsive flexbox layout */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* This div now acts as the left-side container */}
              <div>
                <p className="font-bold text-white">{exercise.name}</p>
                <p className="text-sm text-gray-400">
                  {exercise.sets}x{exercise.reps}
                </p>
              </div>

              {/* WeightStepper is now a direct child of the flex container */}
              <WeightStepper
                value={exercise.weight}
                onIncrement={() => onIncrement (exerciseIndex)}
                onDecrement={() => onDecrement (exerciseIndex)}
                onWeightChange={value => onWeightChange (exerciseIndex, value)}
              />
            </div>
            {/* --- MODIFICATION END --- */}
            <div className="mt-3">
              <SetLogger
                totalSets={exercise.sets}
                completedSets={exercise.completedSets}
                onSetToggle={setIndex => onSetToggle (exerciseIndex, setIndex)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubSetWorkout;
