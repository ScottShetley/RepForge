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
        // --- FIX: Check if exercise.sets is actually an array before calling .every() ---
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
            // Ensure reps and weight are numbers before calculating
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
