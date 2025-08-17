import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../hooks/useAuth'; // MODIFIED
import {
  createInitialUserProgress,
  updateUserProfile,
} from '../services/firebase';

const Setup = () => {
  const [weights, setWeights] = useState ({
    squat: '45',
    'bench-press': '45',
    'barbell-row': '65',
    'overhead-press': '45',
    deadlift: '95',
  });
  const [loading, setLoading] = useState (false);
  const [error, setError] = useState ('');
  const {currentUser, refreshUserProfile} = useAuth ();
  const navigate = useNavigate ();

  const handleChange = e => {
    setWeights ({
      ...weights,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault ();
    setError ('');

    const baselineWeights = {};
    let hasInvalidInput = false;
    for (const key in weights) {
      const value = parseFloat (weights[key]);
      if (isNaN (value) || value < 0) {
        hasInvalidInput = true;
        break;
      }
      baselineWeights[key] = value;
    }

    if (hasInvalidInput) {
      setError ('Please enter a valid, non-negative number for all lifts.');
      return;
    }

    try {
      setLoading (true);
      await createInitialUserProgress (currentUser.uid, baselineWeights);
      await updateUserProfile (currentUser.uid, {isSetupComplete: true});
      await refreshUserProfile ();
      navigate ('/');
    } catch (err) {
      setError ('Failed to save starting weights. Please try again.');
      console.error ('An error occurred during setup form submission:', err);
    } finally {
      setLoading (false);
    }
  };

  const liftInputs = [
    {id: 'squat', label: 'Squat'},
    {id: 'bench-press', label: 'Bench Press'},
    {id: 'barbell-row', label: 'Barbell Row'},
    {id: 'overhead-press', label: 'Overhead Press'},
    {id: 'deadlift', label: 'Deadlift'},
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-gray-900 p-8 shadow-2xl">
          <h1 className="mb-2 text-center text-3xl font-bold text-cyan-400">
            Welcome to RepForge
          </h1>
          <p className="mb-6 text-center text-gray-400">
            Let's set your starting weights for the main lifts. You can always adjust these later.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {liftInputs.map (({id, label}) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block text-sm font-medium text-gray-300"
                >
                  {label} (lbs)
                </label>
                <input
                  type="number"
                  name={id}
                  id={id}
                  value={weights[id]}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-2 text-white placeholder-gray-500 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                  required
                />
              </div>
            ))}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              {loading ? 'Saving...' : 'Save & Start Workout'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Setup;
