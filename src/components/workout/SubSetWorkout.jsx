// FINAL CORRECTED VERSION: 9/1/2025
import React from 'react';
import SetLogger from './SetLogger';
import WeightStepper from './WeightStepper';
import {FaLock} from 'react-icons/fa';

const SubSetWorkout = ({
  exercises,
  onSetToggle,
  onWeightChange,
  onIncrement,
  onDecrement,
  isComplete,
  onLockIn,
}) => {
  // Add a safeguard for undefined or non-array exercises
  if (!Array.isArray (exercises)) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-2xl font-bold text-white">Subset Workout</h3>
      <div className="space-y-6">
        {exercises.map ((exercise, index) => {
          const isLocked = exercise.isLocked || isComplete;
          return (
            <div
              key={exercise.id || index} // Use index as a fallback key
              className={`rounded-lg p-4 shadow-md ${isLocked ? 'bg-gray-800' : 'bg-gray-700'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="mb-2 flex-grow sm:mb-0">
                  <h4 className="text-lg font-bold text-white">
                    {exercise.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {/* This line is corrected to safely access array length */}
                    {(exercise.sets || []).length}x{exercise.reps}
                  </p>
                </div>

                {/* MODIFIED FOR CONSISTENT ALIGNMENT */}
                <div className="flex flex-wrap items-center justify-start gap-4">
                  {!isLocked &&
                    <WeightStepper
                      weight={exercise.weight}
                      onIncrement={() => onIncrement (index)}
                      onDecrement={() => onDecrement (index)}
                      onWeightChange={newWeight =>
                        onWeightChange (index, newWeight)}
                    />}
                  <button
                    onClick={() => onLockIn (index)}
                    disabled={isLocked}
                    className="rounded bg-cyan-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-gray-500"
                  >
                    <FaLock className="mr-1 inline" /> Lock it in
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <SetLogger
                  sets={exercise.sets || []} // Pass empty array if sets are missing
                  onSetToggle={setIndex => onSetToggle (index, setIndex)}
                  isComplete={isLocked}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubSetWorkout;
