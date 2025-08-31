import React, {useState, useEffect} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {getWorkouts} from '../../services/firebase';
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

const processDataForCharts = workouts => {
  const chartData = {};
  const coreLifts = [
    'Squat',
    'Bench Press',
    'Seated Cable Row',
    'Overhead Press',
    'Deadlift',
  ];

  coreLifts.forEach (lift => {
    chartData[lift] = [];
  });
  chartData['Circuit Duration'] = []; // Initialize new chart data

  [...workouts].reverse ().forEach (session => {
    const date = new Date (
      session.createdAt.seconds * 1000
    ).toLocaleDateString ('en-US', {month: 'numeric', day: 'numeric'});

    if (session.workoutType === '5x5' && session.exercises) {
      session.exercises.forEach (exercise => {
        if (coreLifts.includes (exercise.name) && exercise.weight > 0) {
          chartData[exercise.name].push ({
            date: date,
            weight: exercise.weight,
          });
        }
      });
    }

    if (session.workoutType === 'circuit' && session.totalTimeInSeconds > 0) {
      chartData['Circuit Duration'].push ({
        date: date,
        Minutes: parseFloat ((session.totalTimeInSeconds / 60).toFixed (2)),
      });
    }
  });

  return chartData;
};

const ProgressCharts = () => {
  const [chartData, setChartData] = useState (null);
  const [loading, setLoading] = useState (true);
  const {currentUser} = useAuth ();

  useEffect (
    () => {
      if (currentUser) {
        const fetchData = async () => {
          setLoading (true);
          try {
            const userWorkouts = await getWorkouts (currentUser.uid);
            const processedData = processDataForCharts (userWorkouts);
            setChartData (processedData);
          } catch (error) {
            console.error (
              'Failed to fetch or process workout data for charts:',
              error
            );
          } finally {
            setLoading (false);
          }
        };
        fetchData ();
      }
    },
    [currentUser]
  );

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">Loading chart data...</div>
    );
  }

  if (!chartData) {
    return (
      <div className="p-4 text-center text-gray-400">
        Could not load chart data.
      </div>
    );
  }

  const chartConfigs = {
    'Circuit Duration': {
      dataKey: 'Minutes',
      stroke: '#f59e0b', // Amber-500
    },
    default: {
      dataKey: 'weight',
      stroke: '#06b6d4', // Cyan-500
    },
  };

  return (
    <div className="space-y-8">
      {Object.entries (chartData).map (([name, data]) => {
        if (data.length < 2) {
          return null;
        }
        const config = chartConfigs[name] || chartConfigs.default;
        return (
          <div key={name} className="rounded-lg bg-gray-900 p-4 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-white">
              {name} Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data}
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
                <Legend wrapperStyle={{color: '#E2E8F0'}} />
                <Line
                  type="monotone"
                  dataKey={config.dataKey}
                  stroke={config.stroke}
                  strokeWidth={2}
                  activeDot={{r: 8}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressCharts;
