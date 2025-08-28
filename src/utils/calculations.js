/**
 * Calculates the combination of plates needed for one side of a barbell.
 * @param {number} targetWeight - The total weight to be lifted.
 * @param {number} barbellWeight - The weight of the barbell being used.
 * @returns {Array|null} An array of objects representing the plates for one side, or null if weight is less than the bar.
 */
export const calculatePlates = (targetWeight, barbellWeight) => {
  const standardPlates = [45, 35, 25, 10, 5, 2.5];

  if (targetWeight <= barbellWeight) {
    return []; // No plates needed
  }

  let weightPerSide = (targetWeight - barbellWeight) / 2;
  const platesResult = [];

  for (const plate of standardPlates) {
    while (weightPerSide >= plate) {
      // Find if this plate is already in the result
      const existingPlate = platesResult.find (p => p.weight === plate);
      if (existingPlate) {
        existingPlate.count += 1;
      } else {
        platesResult.push ({weight: plate, count: 1});
      }
      weightPerSide -= plate;
    }
  }

  return platesResult;
};

/**
 * Calculates personal records (PRs) from a user's workout history.
 * @param {Array} workouts - An array of workout objects from Firestore.
 * @returns {Object} An object containing the PR for each core lift.
 */
export const calculatePRs = workouts => {
  const coreLifts = [
    'Squat',
    'Bench Press',
    'Overhead Press',
    'Deadlift',
    'Seated Cable Row',
  ];
  const prs = {};

  for (const workout of workouts) {
    if (workout.exercises) {
      for (const exercise of workout.exercises) {
        const isSuccessful =
          exercise.sets &&
          Array.isArray (exercise.sets) &&
          exercise.sets.every (set => set.reps >= set.targetReps);

        if (coreLifts.includes (exercise.name) && isSuccessful) {
          const currentPR = prs[exercise.name] || 0;
          if (exercise.weight > currentPR) {
            prs[exercise.name] = exercise.weight;
          }
        }
      }
    }
  }

  return prs;
};

/**
 * Calculates summary statistics for the current month from workout history.
 * @param {Array} workouts - An array of workout objects from Firestore.
 * @returns {Object} An object containing the monthly stats.
 */
export const calculateMonthlyStats = workouts => {
  const now = new Date ();
  const startOfMonth = new Date (now.getFullYear (), now.getMonth (), 1);
  const endOfMonth = new Date (now.getFullYear (), now.getMonth () + 1, 0);

  const monthlyWorkouts = workouts.filter (workout => {
    if (!workout.createdAt || !workout.createdAt.seconds) return false;
    const workoutDate = new Date (workout.createdAt.seconds * 1000);
    return workoutDate >= startOfMonth && workoutDate <= endOfMonth;
  });

  const totalVolume = monthlyWorkouts.reduce ((volume, workout) => {
    let workoutVolume = 0;
    if (workout.exercises) {
      workout.exercises.forEach (exercise => {
        if (exercise.sets && Array.isArray (exercise.sets)) {
          exercise.sets.forEach (set => {
            if (
              typeof set.reps === 'number' &&
              typeof exercise.weight === 'number'
            ) {
              workoutVolume += set.reps * exercise.weight;
            }
          });
        }
      });
    }
    return volume + workoutVolume;
  }, 0);

  return {
    workoutsThisMonth: monthlyWorkouts.length,
    totalVolume: totalVolume,
  };
};

/**
 * Calculates workout streak and heatmap data.
 * @param {Array} workouts - An array of workout objects from Firestore.
 * @returns {Object} An object with streak and heatmap data.
 */
export const calculateStreakAndHeatmap = workouts => {
  if (!workouts || workouts.length === 0) {
    return {streak: 0, heatmapDates: []};
  }

  const heatmapDates = new Set ();
  workouts.forEach (w => {
    if (w.createdAt && w.createdAt.seconds) {
      heatmapDates.add (new Date (w.createdAt.seconds * 1000).toDateString ());
    }
  });

  // Streak Logic
  const mainWorkouts = workouts
    .filter (
      w => w.workoutType !== 'circuit' && w.createdAt && w.createdAt.seconds
    )
    .sort ((a, b) => a.createdAt.seconds - b.createdAt.seconds);

  if (mainWorkouts.length === 0) {
    return {streak: 0, heatmapDates: Array.from (heatmapDates)};
  }

  const getStartOfWeek = d => {
    const date = new Date (d);
    const day = date.getDay ();
    const diff = date.getDate () - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date (date.setDate (diff)).setHours (0, 0, 0, 0);
  };

  const workoutsByWeek = {};
  mainWorkouts.forEach (w => {
    const weekStart = getStartOfWeek (w.createdAt.seconds * 1000);
    if (!workoutsByWeek[weekStart]) {
      workoutsByWeek[weekStart] = 0;
    }
    workoutsByWeek[weekStart]++;
  });

  const sortedWeeks = Object.keys (workoutsByWeek).sort ((a, b) => a - b);

  let currentStreak = 0;
  for (let i = 0; i < sortedWeeks.length; i++) {
    const week = sortedWeeks[i];

    if (i > 0) {
      const prevWeek = sortedWeeks[i - 1];
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (parseInt (week, 10) - parseInt (prevWeek, 10) > oneWeek) {
        currentStreak = 0; // Reset streak if weeks are not consecutive
      }
    }

    if (workoutsByWeek[week] >= 3) {
      currentStreak++;
    } else {
      // Check if this is the current week. If so, the streak is not broken yet.
      const now = new Date ();
      const currentWeekStart = getStartOfWeek (now);
      if (parseInt (week, 10) < currentWeekStart) {
        currentStreak = 0;
      }
    }
  }

  return {streak: currentStreak, heatmapDates: Array.from (heatmapDates)};
};
