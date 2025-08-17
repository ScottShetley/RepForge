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
  limit,
  setDoc,
  getDoc
} from "firebase/firestore";

// ... (firebaseConfig is unchanged)
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

// --- NEW: USER PROFILE FUNCTIONS ---

/**
 * Creates a user profile document in Firestore upon signup.
 * @param {object} user - The user object from Firebase Authentication.
 */
export const createUserProfile = async (user) => {
  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      isSetupComplete: false, // Default to false
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

/**
 * Fetches a user's profile document from Firestore.
 * @param {string} uid - The user's unique ID.
 * @returns {Promise<object|null>} The user profile data or null if not found.
 */
export const getUserProfile = async (uid) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

/**
 * Updates a user's profile document.
 * @param {string} uid - The user's unique ID.
 * @param {object} updates - An object with the fields to update.
 */
export const updateUserProfile = async (uid, updates) => {
    const userRef = doc(db, "users", uid);
    try {
        await updateDoc(userRef, updates);
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
};

// ... (Exercise and Workout Session functions are unchanged)
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

const defaultLifts = [
  { exerciseId: 'squat', name: 'Squat', currentWeight: 45, increment: 5, failureCount: 0 },
  { exerciseId: 'bench-press', name: 'Bench Press', currentWeight: 45, increment: 5, failureCount: 0 },
  { exerciseId: 'barbell-row', name: 'Barbell Row', currentWeight: 65, increment: 5, failureCount: 0 },
  { exerciseId: 'overhead-press', name: 'Overhead Press', currentWeight: 45, increment: 5, failureCount: 0 },
  { exerciseId: 'deadlift', name: 'Deadlift', currentWeight: 95, increment: 10, failureCount: 0 },
];

/**
 * Creates the initial lift progression documents for a user based on their setup form.
 * @param {string} userId - The user's unique ID.
 * @param {object} baselineWeights - An object with starting weights for each core lift.
 */
export const createInitialUserProgress = async (userId, baselineWeights) => {
  const progressCol = collection(db, "user_lift_progress");
  const batch = writeBatch(db);

  const liftsToCreate = defaultLifts.map(lift => ({
    ...lift,
    currentWeight: baselineWeights[lift.exerciseId] || lift.currentWeight,
  }));
  
  liftsToCreate.forEach(lift => {
    const newDocRef = doc(progressCol);
    batch.set(newDocRef, { userId, ...lift });
  });

  await batch.commit();
};


export const getUserProgress = async (userId) => {
  const progressCol = collection(db, "user_lift_progress");
  const q = query(progressCol, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // This is now a fallback for users who existed before the setup flow.
    // New users should have their progress created by `createInitialUserProgress`.
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

export const updateUserProgressAfterWorkout = async (progressId, updates) => {
  const docRef = doc(db, "user_lift_progress", progressId);
  try {
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating user progress: ", error);
    throw new Error("Could not update lift progress.");
  }
};

export default app;