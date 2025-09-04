import React, {useMemo} from 'react';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const processCircuitDataForCharts = workouts => {
  const circuitWorkouts = workouts.filter (w => w.workoutType === 'circuit');
  if (circuitWorkouts.length === 0) return {timeData: [], exerciseData: []};

  const timeData = [...circuitWorkouts].reverse ().map (session => ({
    date: new Date (
      session.createdAt.seconds * 1000
    ).toLocaleDateString ('en-US', {month: 'numeric', day: 'numeric'}),
    Minutes: parseFloat ((session.totalTimeInSeconds / 60).toFixed (2)),
  }));

  const exerciseData = [...circuitWorkouts].reverse ().map (session => ({
    date: new Date (
      session.createdAt.seconds * 1000
    ).toLocaleDateString ('en-US', {month: 'numeric', day: 'numeric'}),
    Completed: session.exercisesCompleted,
  }));

  return {timeData, exerciseData};
};

const CircuitPerformance = ({workouts}) => {
  const {timeData, exerciseData} = useMemo (
    () => processCircuitDataForCharts (workouts),
    [workouts]
  );

  if (timeData.length < 2) {
    return (
      <div className="rounded-lg bg-gray-900 p-4 shadow-lg">
        <h3 className="mb-4 text-xl font-bold text-white">
          Circuit Performance
        </h3>
        <div className="text-center text-gray-400">
          Log at least two circuit workouts to see your progress.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-900 p-4 shadow-lg">
      <h3 className="mb-4 text-xl font-bold text-white">Circuit Performance</h3>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Time Progression Chart */}
        <div>
          <h4 className="mb-2 text-center font-semibold text-gray-300">
            Time Progression
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={timeData}
              margin={{top: 5, right: 20, left: -10, bottom: 5}}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="date" stroke="#A0AEC0" />
              <YAxis stroke="#A0AEC0" domain={[0, 'dataMax + 10']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A202C',
                  border: '1px solid #4A5568',
                }}
              />
              <Legend wrapperStyle={{color: '#E2E8F0'}} />
              <ReferenceLine
                y={30}
                label={{value: 'Gold', fill: '#FFD700'}}
                stroke="#FFD700"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={45}
                label={{value: 'Silver', fill: '#C0C0C0'}}
                stroke="#C0C0C0"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={60}
                label={{value: 'Bronze', fill: '#CD7F32'}}
                stroke="#CD7F32"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="Minutes"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Exercises Completed Chart */}
        <div>
          <h4 className="mb-2 text-center font-semibold text-gray-300">
            Exercises Completed
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={exerciseData}
              margin={{top: 5, right: 20, left: -10, bottom: 5}}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="date" stroke="#A0AEC0" />
              <YAxis stroke="#A0AEC0" domain={[0, 14]} ticks={[0, 7, 10, 14]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A202C',
                  border: '1px solid #4A5568',
                }}
              />
              <Legend wrapperStyle={{color: '#E2E8F0'}} />
              <ReferenceLine
                y={14}
                label={{value: 'Gold', fill: '#FFD700'}}
                stroke="#FFD700"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={10}
                label={{value: 'Silver', fill: '#C0C0C0'}}
                stroke="#C0C0C0"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={7}
                label={{value: 'Bronze', fill: '#CD7F32'}}
                stroke="#CD7F32"
                strokeDasharray="3 3"
              />
              <Bar dataKey="Completed" fill="#2dd4bf" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CircuitPerformance;
