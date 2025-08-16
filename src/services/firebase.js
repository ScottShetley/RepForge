import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs
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

// --- NEW WORKOUT FUNCTIONS ---

/**
 * Saves a completed workout session to Firestore.
 * @param {string} userId - The ID of the user.
 * @param {object} workoutData - The workout data object to save.
 */
export const saveWorkout = async (userId, workoutData) => {
  try {
    const docRef = await addDoc(collection(db, "workouts"), {
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
    const workoutsCol = collection(db, "workouts");
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

export default app;