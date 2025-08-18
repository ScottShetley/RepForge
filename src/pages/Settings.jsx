import React, {useState, useEffect} from 'react';
import MainLayout from '../components/layout/MainLayout';
import {useAuth} from '../hooks/useAuth';
import {
  getUserSettings,
  saveUserSettings,
  resetLiftProgress,
  resetAllProgress,
} from '../services/firebase';

const coreLifts = [
  {id: 'squat', name: 'Squat'},
  {id: 'bench-press', name: 'Bench Press'},
  {id: 'barbell-row', name: 'Barbell Row'},
  {id: 'overhead-press', name: 'Overhead Press'},
  {id: 'deadlift', name: 'Deadlift'},
];

const Settings = () => {
  const {currentUser} = useAuth ();
  const [settings, setSettings] = useState (null);
  const [status, setStatus] = useState ({message: '', type: ''});
  const [isLoading, setIsLoading] = useState (true);

  useEffect (
    () => {
      if (currentUser) {
        const fetchSettings = async () => {
          setIsLoading (true);
          const userSettings = await getUserSettings (currentUser.uid);
          setSettings (userSettings);
          setIsLoading (false);
        };
        fetchSettings ();
      }
    },
    [currentUser]
  );

  const handleChange = e => {
    const {name, value, type} = e.target;
    // For the select, value is a string, so we need to parse it to a number
    const parsedValue = name === 'barbellWeight' || type === 'number'
      ? parseInt (value, 10)
      : value;

    setSettings (prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleIncrementChange = (liftId, value) => {
    const parsedValue = parseInt (value, 10) || 0;
    setSettings (prev => ({
      ...prev,
      increments: {
        ...prev.increments,
        [liftId]: parsedValue,
      },
    }));
  };

  const handleSave = async e => {
    e.preventDefault ();
    setStatus ({message: 'Saving...', type: 'loading'});
    try {
      await saveUserSettings (currentUser.uid, settings);
      setStatus ({message: 'Settings saved successfully!', type: 'success'});
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setStatus ({message: 'Failed to save settings.', type: 'error'});
    }
  };

  const handleResetLift = async liftId => {
    const lift = coreLifts.find (l => l.id === liftId);
    if (
      window.confirm (
        `Are you sure you want to reset the progress for ${lift.name}? This cannot be undone.`
      )
    ) {
      setStatus ({message: 'Resetting...', type: 'loading'});
      try {
        await resetLiftProgress (currentUser.uid, liftId);
        setStatus ({
          message: `${lift.name} progress has been reset.`,
          type: 'success',
        });
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setStatus ({message: `Failed to reset ${lift.name}.`, type: 'error'});
      }
    }
  };

  const handleResetAll = async () => {
    const confirmation = window.prompt (
      "To confirm, please type 'RESET' in all caps. This will reset all your core lift progress."
    );
    if (confirmation === 'RESET') {
      setStatus ({message: 'Resetting all progress...', type: 'loading'});
      try {
        await resetAllProgress (currentUser.uid);
        setStatus ({message: 'All progress has been reset.', type: 'success'});
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setStatus ({message: 'Failed to reset all progress.', type: 'error'});
      }
    }
  };

  if (isLoading || !settings) {
    return (
      <MainLayout>
        <div className="p-6 text-center">Loading settings...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6 mx-auto max-w-3xl">
        <h2 className="mb-6 text-3xl font-bold text-white">Settings</h2>

        <form onSubmit={handleSave} className="space-y-8">
          {/* General Settings */}
          <div className="p-6 bg-gray-900 rounded-lg">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">
              General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="barbellWeight"
                  className="block text-sm font-medium text-gray-300"
                >
                  Default Barbell Weight (lbs)
                </label>
                <select
                  id="barbellWeight"
                  name="barbellWeight"
                  value={settings.barbellWeight}
                  onChange={handleChange}
                  className="mt-1 block w-full max-w-xs bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="45">Standard Olympic Bar (45 lbs)</option>
                  <option value="35">Women's Olympic Bar (35 lbs)</option>
                  <option value="15">Technique/Training Bar (15 lbs)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="legPressSledWeight"
                  className="block text-sm font-medium text-gray-300"
                >
                  Leg Press Sled Weight (lbs)
                </label>
                <input
                  type="number"
                  id="legPressSledWeight"
                  name="legPressSledWeight"
                  value={settings.legPressSledWeight}
                  onChange={handleChange}
                  className="mt-1 block w-full max-w-xs bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Weight Increments */}
          <div className="p-6 bg-gray-900 rounded-lg">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">
              Weight Increments (lbs)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {coreLifts.map (lift => (
                <div key={lift.id}>
                  <label
                    htmlFor={lift.id}
                    className="block text-sm font-medium text-gray-300"
                  >
                    {lift.name}
                  </label>
                  <input
                    type="number"
                    id={lift.id}
                    name={lift.id}
                    step="1"
                    min="0"
                    value={settings.increments[lift.id]}
                    onChange={e =>
                      handleIncrementChange (lift.id, e.target.value)}
                    className="mt-1 block w-full max-w-xs bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-6 py-2 text-base font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              Save Settings
            </button>
            {status.message &&
              <span
                className={`text-sm ${status.type === 'success' ? 'text-green-400' : status.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}
              >
                {status.message}
              </span>}
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-12 p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
          <h3 className="text-xl font-semibold text-red-400 mb-4">
            Danger Zone
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-300 mb-2">
                Reset individual lift progress back to its default starting weight.
              </p>
              <div className="flex flex-wrap gap-2">
                {coreLifts.map (lift => (
                  <button
                    key={lift.id}
                    onClick={() => handleResetLift (lift.id)}
                    className="px-3 py-1 text-sm font-medium bg-red-800 hover:bg-red-700 rounded-md"
                  >
                    Reset {lift.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-300 mb-2">
                Reset all your core lift progress. This action is irreversible.
              </p>
              <button
                onClick={handleResetAll}
                className="px-4 py-2 font-bold bg-red-800 hover:bg-red-700 rounded-md w-full md:w-auto"
              >
                Reset All Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
