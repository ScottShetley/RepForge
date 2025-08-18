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
