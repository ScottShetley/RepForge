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

// Function to process raw workout data into a format suitable for charts
const processDataForCharts = workouts => {
  const chartData = {};
  const coreLifts = [
    'Squat',
    'Bench Press',
    'Seated Cable Row',
    'Overhead Press',
    'Deadlift',
  ];

  // Initialize arrays for each core lift
  coreLifts.forEach (lift => {
    chartData[lift] = [];
  });

  // Iterate workouts from oldest to newest for a proper timeline
  [...workouts].reverse ().forEach (session => {
    if (session.workoutType === '5x5' && session.exercises) {
      const date = new Date (
        session.createdAt.seconds * 1000
      ).toLocaleDateString ('en-US', {month: 'numeric', day: 'numeric'});

      session.exercises.forEach (exercise => {
        if (coreLifts.includes (exercise.name)) {
          // Add data point if weight is valid
          if (exercise.weight && exercise.weight > 0) {
            chartData[exercise.name].push ({
              date: date,
              weight: exercise.weight,
            });
          }
        }
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

  return (
    <div className="space-y-8">
      {Object.entries (chartData).map (([liftName, data]) => {
        // Only render a chart if there are at least two data points
        if (data.length < 2) {
          return null;
        }
        return (
          <div key={liftName} className="rounded-lg bg-gray-900 p-4 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-white">
              {liftName} Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 20,
                  left: -10,
                  bottom: 5,
                }}
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
                  dataKey="weight"
                  stroke="#06b6d4" // Cyan-500
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
