import React, {useState, useMemo} from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CORE_LIFTS = [
  'Squat',
  'Bench Press',
  'Seated Cable Row',
  'Overhead Press',
  'Deadlift',
];

const LIFT_COLORS = {
  Squat: '#8884d8',
  'Bench Press': '#82ca9d',
  'Seated Cable Row': '#ffc658',
  'Overhead Press': '#ff8042',
  Deadlift: '#e60000',
};

const processStrengthDataForChart = workouts => {
  const dataByDate = {};

  [...workouts].reverse ().forEach (session => {
    const date = new Date (
      session.createdAt.seconds * 1000
    ).toLocaleDateString ('en-US', {month: 'numeric', day: 'numeric'});

    if (session.workoutType === '5x5' && session.exercises) {
      if (!dataByDate[date]) {
        dataByDate[date] = {date};
      }
      session.exercises.forEach (exercise => {
        if (CORE_LIFTS.includes (exercise.name) && exercise.weight > 0) {
          dataByDate[date][exercise.name] = Math.max (
            dataByDate[date][exercise.name] || 0,
            exercise.weight
          );
        }
      });
    }
  });

  return Object.values (dataByDate).sort (
    (a, b) =>
      new Date (a.date.split ('/').join ('/' + new Date ().getFullYear ())) -
      new Date (b.date.split ('/').join ('/' + new Date ().getFullYear ()))
  );
};

const ProgressCharts = ({workouts}) => {
  const [visibleLifts, setVisibleLifts] = useState ({
    Squat: true,
    'Bench Press': true,
    'Seated Cable Row': true,
    'Overhead Press': true,
    Deadlift: true,
  });

  const strengthData = useMemo (() => processStrengthDataForChart (workouts), [
    workouts,
  ]);

  const handleLegendClick = e => {
    const {dataKey} = e;
    if (Object.prototype.hasOwnProperty.call (visibleLifts, dataKey)) {
      setVisibleLifts (prevState => ({
        ...prevState,
        [dataKey]: !prevState[dataKey],
      }));
    }
  };

  const hasEnoughData = strengthData.length >= 2;

  if (!hasEnoughData) {
    return (
      <div className="rounded-lg bg-gray-900 p-4 shadow-lg">
        <h3 className="mb-4 text-xl font-bold text-white">
          Strength Progression
        </h3>
        <div className="text-center text-gray-400">
          Log at least two strength workouts to see your progress chart.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-900 p-4 shadow-lg">
      <h3 className="mb-4 text-xl font-bold text-white">
        Strength Progression
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={strengthData}
          margin={{top: 5, right: 20, left: -10, bottom: 5}}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="date" stroke="#A0AEC0" />
          <YAxis stroke="#A0AEC0" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A202C',
              border: '1px solid #4A5568',
            }}
            labelStyle={{color: '#E2E8F0'}}
          />
          <Legend
            onClick={handleLegendClick}
            wrapperStyle={{color: '#E2E8F0', cursor: 'pointer'}}
          />
          {CORE_LIFTS.map (lift => (
            <Line
              key={lift}
              type="monotone"
              dataKey={lift}
              stroke={LIFT_COLORS[lift]}
              strokeWidth={2}
              activeDot={{r: 8}}
              hide={!visibleLifts[lift]}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressCharts;
