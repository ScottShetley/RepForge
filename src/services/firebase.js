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
  orderBy,
  limit
} from "firebase/firestore";

// Your web app's Firebase configuration...
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- EXERCISE LIBRARY FUNCTIONS ---

/**
 * Fetches all exercises of a specific category for the swap modal.
 * @param {string} category - The category of exercises to fetch.
 * @returns {Promise<Array>} A promise that resolves to an array of exercise objects.
 */
export const getExercisesByCategory = async (category) => {
  try {
    const exercisesCol = collection(db, "exercises");
    const q = query(exercisesCol, where("category", "==", category));
    const querySnapshot = await getDocs(q);

    const exercises = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return exercises;
  } catch (error) {
    console.error("Error fetching exercises by category: ", error);
    throw new Error("Could not fetch exercises.");
  }
};


// --- WORKOUT SESSION FUNCTIONS ---
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
      return null;
    }

    const lastWorkout = querySnapshot.docs[0].data();
    return lastWorkout;

  } catch (error) {
    console.error("Error fetching last workout: ", error);
    throw new Error("Could not fetch last workout.");
  }
};


// --- USER LIFT PROGRESSION FUNCTIONS ---

// MODIFIED: Added failureCount to the default data model.
const defaultLifts = [
  { exerciseId: 'squat', name: 'Squat', currentWeight: 45, increment: 5, failureCount: 0 },
  { exerciseId: 'bench-press', name: 'Bench Press', currentWeight: 45, increment: 5, failureCount: 0 },
  { exerciseId: 'barbell-row', name: 'Barbell Row', currentWeight: 65, increment: 5, failureCount: 0 },
  { exerciseId: 'overhead-press', name: 'Overhead Press', currentWeight: 45, increment: 5, failureCount: 0 },
  { exerciseId: 'deadlift', name: 'Deadlift', currentWeight: 95, increment: 10, failureCount: 0 },
];

export const getUserProgress = async (userId) => {
  const progressCol = collection(db, "user_lift_progress");
  const q = query(progressCol, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
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
    const userProgress = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      userProgress[data.exerciseId] = { id: doc.id, ...data };
    });
    return userProgress;
  }
};

/**
 * NEW / REPLACES updateUserProgress: A more flexible function to update any
 * combination of fields for a user's lift progression.
 * @param {string} progressId - The document ID of the user's lift progression.
 * @param {object} updates - An object containing the fields to update.
 */
export const updateUserProgressAfterWorkout = async (progressId, updates) => {
  const docRef = doc(db, "user_lift_progress", progressId);
  try {
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating user progress: ", error);
    throw new Error("Could not update lift progress.");
  }
};

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