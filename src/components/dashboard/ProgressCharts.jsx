import React, {useState, useMemo, useEffect} from 'react';
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

const LOCAL_STORAGE_KEY = 'repForgeChartFilters';

const EXERCISE_CATEGORIES = {
  Squat: ['Squat', 'Leg Press'],
  'Bench Press': ['Bench Press', 'Dumbbell Bench Press', 'Incline Bench Press'],
  Row: ['Seated Cable Row', 'Barbell Row'],
  'Overhead Press': ['Overhead Press', 'Dumbbell Shoulder Press'],
  Deadlift: ['Deadlift', 'Romanian Deadlift'],
};

const EXERCISE_COLOR_MAP = {
  // Squat Category
  Squat: '#8884d8', // Purple
  'Leg Press': '#A78BFA', // Light Violet
  // Bench Category
  'Bench Press': '#ffc658', // Yellow
  'Dumbbell Bench Press': '#FBBF24', // Amber
  'Incline Bench Press': '#60A5FA', // Blue
  // Row Category
  'Seated Cable Row': '#34D399', // Green
  'Barbell Row': '#2DD4BF', // Teal
  // OHP Category
  'Overhead Press': '#FFFFFF', // White
  'Dumbbell Shoulder Press': '#F9A8D4', // Pink
  // Deadlift Category
  Deadlift: '#EF4444', // Red
  'Romanian Deadlift': '#F87171', // Light Red
};

const ALL_EXERCISES = Object.values (EXERCISE_CATEGORIES).flat ();

const processStrengthDataForChart = (workouts, visibleLifts) => {
  const dataByDate = {};
  const baselines = {};

  const sortedWorkouts = [...workouts].sort (
    (a, b) => a.createdAt.seconds - b.createdAt.seconds
  );

  sortedWorkouts.forEach (session => {
    if (session.workoutType !== '5x5' || !session.exercises) return;

    const date = new Date (
      session.createdAt.seconds * 1000
    ).toLocaleDateString ('en-US', {month: 'numeric', day: 'numeric'});
    if (!dataByDate[date]) {
      dataByDate[date] = {date};
    }

    session.exercises.forEach (exercise => {
      if (visibleLifts[exercise.name] && exercise.weight > 0) {
        if (!baselines[exercise.name]) {
          baselines[exercise.name] = exercise.weight;
        }

        const baselineWeight = baselines[exercise.name];
        const percentage = (exercise.weight / baselineWeight - 1) * 100;

        dataByDate[date][exercise.name] = Math.max (
          dataByDate[date][exercise.name] || 0,
          percentage
        );
      }
    });
  });

  return Object.values (dataByDate);
};

const CustomTooltip = ({active, payload, label}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-gray-700 bg-gray-900 p-3 shadow-lg">
        <p className="font-bold text-gray-200">{`Date: ${label}`}</p>
        {payload.map (p => (
          <p key={p.name} style={{color: p.color}}>
            {`${p.name}: ${p.value.toFixed (1)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AccordionFilter = ({visibleLifts, setVisibleLifts}) => {
  const [isOpen, setIsOpen] = useState (false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen (!isOpen)}
        className="flex w-full items-center justify-between rounded-md bg-gray-800 px-4 py-2 text-lg font-bold text-white transition-colors hover:bg-gray-700"
      >
        <span>Filter Exercises</span>
        <span
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          &#9660;
        </span>
      </button>
      {isOpen &&
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-gray-800 p-4 sm:grid-cols-3 md:grid-cols-5">
          {Object.entries (
            EXERCISE_CATEGORIES
          ).map (([category, exercises]) => (
            <div key={category} className="flex flex-col items-start">
              <strong className="text-sm font-bold text-white">
                {category}
              </strong>
              {exercises.map (exercise => (
                <label
                  key={exercise}
                  className="flex items-center space-x-2 text-sm text-gray-300"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 rounded bg-gray-700 text-indigo-600"
                    checked={!!visibleLifts[exercise]}
                    onChange={() => {
                      setVisibleLifts (prev => ({
                        ...prev,
                        [exercise]: !prev[exercise],
                      }));
                    }}
                  />
                  <span>{exercise}</span>
                </label>
              ))}
            </div>
          ))}
        </div>}
    </div>
  );
};

const ProgressCharts = ({workouts}) => {
  const [visibleLifts, setVisibleLifts] = useState (() => {
    try {
      const savedFilters = localStorage.getItem (LOCAL_STORAGE_KEY);
      if (savedFilters) {
        return JSON.parse (savedFilters);
      }
    } catch (error) {
      console.error ('Could not parse saved chart filters:', error);
    }
    return ALL_EXERCISES.reduce ((acc, ex) => ({...acc, [ex]: true}), {});
  });

  useEffect (
    () => {
      try {
        localStorage.setItem (LOCAL_STORAGE_KEY, JSON.stringify (visibleLifts));
      } catch (error) {
        console.error ('Could not save chart filters:', error);
      }
    },
    [visibleLifts]
  );

  const strengthData = useMemo (
    () => processStrengthDataForChart (workouts, visibleLifts),
    [workouts, visibleLifts]
  );

  const hasEnoughData =
    strengthData.some (d => Object.keys (d).length > 1) &&
    strengthData.length >= 2;

  if (workouts.length < 2) {
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
      <h3 className="text-center text-xl font-bold text-white">
        Strength Progression
      </h3>

      <AccordionFilter
        visibleLifts={visibleLifts}
        setVisibleLifts={setVisibleLifts}
      />

      {hasEnoughData
        ? <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={strengthData}
              margin={{top: 5, right: 20, left: -10, bottom: 5}}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              {/* This is the line that was changed */}
              <XAxis dataKey="date" stroke="#A0AEC0" interval="preserveEnd" />
              <YAxis
                stroke="#A0AEC0"
                tickFormatter={tick => `${tick.toFixed (0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.entries (visibleLifts).map (
                ([exercise, isVisible]) =>
                  isVisible &&
                  <Line
                    key={exercise}
                    type="monotone"
                    dataKey={exercise}
                    stroke={EXERCISE_COLOR_MAP[exercise]}
                    strokeWidth={2}
                    activeDot={{r: 8}}
                    connectNulls
                  />
              )}
            </LineChart>
          </ResponsiveContainer>
        : <div className="flex h-[300px] items-center justify-center text-center text-gray-400">
            Select an exercise with at least two data points to view its progression.
          </div>}
    </div>
  );
};

export default ProgressCharts;
