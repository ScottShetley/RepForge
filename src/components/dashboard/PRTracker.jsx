import React from 'react';

const PRTracker = ({ prs }) => {
  const prEntries = Object.entries(prs);

  if (prEntries.length === 0) {
    return null; // Don't render anything if there are no PRs yet
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-white mb-4">Personal Records</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {prEntries.map(([lift, weight]) => (
          <div key={lift} className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm font-medium">{lift}</p>
            <p className="text-cyan-400 text-2xl font-bold">{weight} lbs</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PRTracker;