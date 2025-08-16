import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  updateDoc,
  orderBy, // Import orderBy
  limit // Import limit
} from "firebase/firestore";

// Your web app's Firebase configuration, read from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- WORKOUT SESSION FUNCTIONS ---

/**
 * Saves a completed workout session to Firestore.
 * @param {string} userId - The ID of the user.
 * @param {object} workoutData - The workout data object to save.
 */
export const saveWorkout = async (userId, workoutData) => {
  try {
    const docRef = await addDoc(collection(db, "workout_sessions"), {
      userId: userId,
      ...workoutData,
      createdAt: serverTimestamp(),
    });
    console.log("Workout saved with ID: ", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error saving workout: ", error);
    throw new Error("Could not save workout session.");
  }
};

/**
 * Fetches all workout sessions for a specific user.
 * @param {string} userId - The ID of the user whose workouts to fetch.
 * @returns {Promise<Array>} A promise that resolves to an array of workout objects.
 */
export const getWorkouts = async (userId) => {
  try {
    const workoutsCol = collection(db, "workout_sessions");
    const q = query(workoutsCol, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const workouts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return workouts;
  } catch (error) {
    console.error("Error fetching workouts: ", error);
    throw new Error("Could not fetch workout history.");
  }
};

/**
 * NEW: Fetches the single most recent workout session for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object|null>} A promise that resolves to the last workout object or null if none exist.
 */
export const getLastWorkout = async (userId) => {
  try {
    const workoutsCol = collection(db, "workout_sessions");
    const q = query(
      workoutsCol,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null; // No workouts found for this user
    }

    const lastWorkout = querySnapshot.docs[0].data();
    return lastWorkout;

  } catch (error) {
    console.error("Error fetching last workout: ", error);
    throw new Error("Could not fetch last workout.");
  }
};


// --- USER LIFT PROGRESSION FUNCTIONS ---

// Default starting values for a new user's core lifts
const defaultLifts = [
  { exerciseId: 'squat', name: 'Squat', currentWeight: 45, increment: 5 },
  { exerciseId: 'bench-press', name: 'Bench Press', currentWeight: 45, increment: 5 },
  { exerciseId: 'barbell-row', name: 'Barbell Row', currentWeight: 65, increment: 5 },
  { exerciseId: 'overhead-press', name: 'Overhead Press', currentWeight: 45, increment: 5 },
  { exerciseId: 'deadlift', name: 'Deadlift', currentWeight: 95, increment: 10 },
];

/**
 * Fetches a user's lift progression data. If it doesn't exist, it creates it.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} A promise that resolves to an object mapping exerciseId to progress data.
 */
export const getUserProgress = async (userId) => {
  const progressCol = collection(db, "user_lift_progress");
  const q = query(progressCol, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // User has no progress data, so create it
    const batch = writeBatch(db);
    const userProgress = {};

    defaultLifts.forEach(lift => {
      const newDocRef = doc(progressCol);
      batch.set(newDocRef, { userId, ...lift });
      userProgress[lift.exerciseId] = { id: newDocRef.id, ...lift };
    });

    await batch.commit();
    return userProgress;
  } else {
    // User has existing progress data, format it for use
    const userProgress = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      userProgress[data.exerciseId] = { id: doc.id, ...data };
    });
    return userProgress;
  }
};

/**
 * Updates the current weight for a specific lift.
 * @param {string} progressId - The document ID of the user_lift_progress entry.
 * @param {number} newWeight - The new weight to set for the lift.
 */
export const updateUserProgress = async (progressId, newWeight) => {
  const docRef = doc(db, "user_lift_progress", progressId);
  try {
    await updateDoc(docRef, { currentWeight: newWeight });
  } catch (error) {
    console.error("Error updating user progress: ", error);
    throw new Error("Could not update lift progress.");
  }
};

/**
 * Updates the custom weight increment for a specific lift.
 * @param {string} progressId - The document ID of the user_lift_progress entry.
 * @param {number} newIncrement - The new increment value to set.
 */
export const updateIncrement = async (progressId, newIncrement) => {
  const docRef = doc(db, "user_lift_progress", progressId);
  try {
    await updateDoc(docRef, { increment: newIncrement });
  } catch (error) {
    console.error("Error updating increment: ", error);
    throw new Error("Could not update increment.");
  }
};

export default app;