import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {useAuth} from '../hooks/useAuth';
import {getLastWorkout} from '../services/firebase';
import {FaArrowRight} from 'react-icons/fa';

const WorkoutCard = ({title, description, isRecommended, onClick}) => (
  <button
    onClick={onClick}
    className={`relative w-full rounded-lg bg-gray-700 p-6 text-left shadow-lg transition-all duration-300 hover:bg-gray-600 hover:shadow-cyan-500/20 ${isRecommended ? 'border-2 border-cyan-400' : 'border-2 border-transparent'}`}
  >
    {isRecommended &&
      <div className="absolute -top-3 right-4 rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-gray-900">
        Recommended
      </div>}
    <h3 className="text-2xl font-bold text-white">{title}</h3>
    <p className="mt-2 text-gray-300">{description}</p>
    <div className="mt-4 flex items-center text-cyan-400">
      <span>Start Workout</span>
      <FaArrowRight className="ml-2" />
    </div>
  </button>
);

const WorkoutSelection = () => {
  const {currentUser} = useAuth ();
  const navigate = useNavigate ();
  const [recommendedWorkoutId, setRecommendedWorkoutId] = useState (null);
  const [isLoading, setIsLoading] = useState (true);

  useEffect (
    () => {
      if (currentUser) {
        const determineRecommendation = async () => {
          setIsLoading (true);
          const lastWorkout = await getLastWorkout (currentUser.uid);
          const nextWorkout = !lastWorkout || lastWorkout.id === 'workoutB'
            ? 'workoutA'
            : 'workoutB';
          setRecommendedWorkoutId (nextWorkout);
          setIsLoading (false);
        };
        determineRecommendation ();
      }
    },
    [currentUser]
  );

  const handleSelectRepForge = workoutId => {
    navigate ('/workout', {state: {workoutId}});
  };

  const handleSelectCircuit = () => {
    navigate ('/circuit-tracker');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 text-center">Loading recommendations...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <h2 className="mb-8 text-center text-3xl font-bold text-white">
          Choose Your Workout
        </h2>
        <div className="space-y-6">
          <WorkoutCard
            title="RepForge: Workout A"
            description="A core strength session focused on Squat, Bench Press, and Rows."
            isRecommended={recommendedWorkoutId === 'workoutA'}
            onClick={() => handleSelectRepForge ('workoutA')}
          />
          <WorkoutCard
            title="RepForge: Workout B"
            description="A core strength session focused on Squat, Overhead Press, and Deadlifts."
            isRecommended={recommendedWorkoutId === 'workoutB'}
            onClick={() => handleSelectRepForge ('workoutB')}
          />
          <WorkoutCard
            title="Circuit Training"
            description="A fast-paced, machine-based workout targeting multiple muscle groups."
            isRecommended={false}
            onClick={handleSelectCircuit}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default WorkoutSelection;
