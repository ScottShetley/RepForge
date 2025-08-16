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
      {/* CORRECTED: Title changed back to "Subset Workout" */}
      <h3 className="mb-4 text-2xl font-bold text-gray-300">
        Subset Workout
      </h3>
      <div className="space-y-4 rounded-lg bg-gray-700/50 p-4">
        {exercises.map ((exercise, exerciseIndex) => (
          <div key={exercise.id}>
            <div className="grid grid-cols-3 items-center gap-2">
              <div className="col-span-1">
                <p className="font-bold text-white">{exercise.name}</p>
                <p className="text-sm text-gray-400">
                  {exercise.sets}x{exercise.reps}
                </p>
              </div>

              <div className="col-span-2 flex justify-end">
                <WeightStepper
                  value={exercise.weight}
                  onIncrement={() => onIncrement (exerciseIndex)}
                  onDecrement={() => onDecrement (exerciseIndex)}
                  onWeightChange={value =>
                    onWeightChange (exerciseIndex, value)}
                />
              </div>
            </div>
            <div className="mt-2">
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
