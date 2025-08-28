import React from 'react';

const StatCard = ({label, value, unit}) => (
  <div className="bg-gray-900 p-4 rounded-lg text-center shadow-md">
    <p className="text-sm text-gray-400 font-medium">{label}</p>
    <p className="text-3xl font-bold text-cyan-400">
      {value}
      {unit && <span className="text-lg text-gray-400 ml-1">{unit}</span>}
    </p>
  </div>
);

const SummaryStats = ({stats, streak}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard label="Current Streak" value={streak} unit="Weeks" />
      <StatCard label="Workouts This Month" value={stats.workoutsThisMonth} />
      <StatCard
        label="Total Volume Lifted"
        value={stats.totalVolume.toLocaleString ()}
        unit="lbs"
      />
    </div>
  );
};

export default SummaryStats;
