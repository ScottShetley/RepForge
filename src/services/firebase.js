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
 * Fetches all exercises.
 * @returns {Promise<Array>} A promise that resolves to an array of exercise objects.
 */
export const getAllExercises = async () => {
  try {
    const exercisesCol = collection(db, "exercises");
    const q = query(exercisesCol);
    const querySnapshot = await getDocs(q);

    const exercises = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return exercises;
  } catch (error) {
    console.error("Error fetching all exercises: ", error);
    throw new Error("Could not fetch exercises.");
  }
};


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
      workoutType: '5x5', // Specify workout type
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
 * NEW: Saves a completed circuit workout session to Firestore.
 * @param {string} userId - The user's unique ID.
 * @param {object} workoutData - The circuit workout data (e.g., list of exercises with reps/weight).
 * @returns {Promise<DocumentReference>} A promise that resolves to the new document reference.
 */
export const saveCircuitWorkout = async (userId, workoutData) => {
  try {
    const docRef = await addDoc(collection(db, 'workout_sessions'), {
      userId: userId,
      ...workoutData,
      workoutType: 'circuit', // Specify workout type
      createdAt: serverTimestamp(),
    });
    console.log('Circuit workout saved with ID: ', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error saving circuit workout: ', error);
    throw new Error('Could not save circuit workout session.');
  }
};


export const getWorkouts = async (userId) => {
  try {
    const workoutsCol = collection(db, "workout_sessions");
    const q = query(workoutsCol, where("userId", "==", userId), orderBy("createdAt", "desc"));
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
      where("workoutType", "==", "5x5"), // Only get the last 5x5 workout for progression
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
  // --- NEW: Add Seated Cable Row to defaults for reference ---
  { exerciseId: 'seated-cable-row', name: 'Seated Cable Row', currentWeight: 45, increment: 5, failureCount: 0 },
];

/**
 * Creates the initial lift progression documents for a user based on their setup form.
 * @param {string} userId - The user's unique ID.
 * @param {object} baselineWeights - An object with starting weights for each core lift.
 */
// --- MODIFICATION START ---
// Rewritten function to fix bugs
export const createInitialUserProgress = async (userId, baselineWeights) => {
  const progressColRef = collection(db, 'users', userId, 'user_lift_progress');
  const batch = writeBatch(db);

  // Loop through the baseline weights provided from the setup form
  for (const exerciseId in baselineWeights) {
    // Find the matching default lift to get its name and increment
    const defaultLift = defaultLifts.find(lift => lift.exerciseId === exerciseId);
    
    // Create a new document with a SPECIFIC ID to prevent duplicates
    const docRef = doc(progressColRef, exerciseId);

    const liftData = {
      userId,
      exerciseId,
      name: defaultLift ? defaultLift.name : exerciseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      currentWeight: baselineWeights[exerciseId],
      increment: defaultLift ? defaultLift.increment : 5, // Default to 5 if not found
      failureCount: 0,
    };
    
    batch.set(docRef, liftData);
  }

  await batch.commit();
};
// --- MODIFICATION END ---


export const getUserProgress = async (userId) => {
  // --- MODIFICATION: Point to the correct sub-collection ---
  const progressCol = collection(db, "users", userId, "user_lift_progress");
  const q = query(progressCol); // No longer need the where clause for userId
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return {}; // Return empty object if no progress is found, don't create defaults here
  } else {
    const userProgress = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      // The key is the document ID itself, which we now control
      userProgress[doc.id] = { id: doc.id, ...data }; 
    });
    return userProgress;
  }
};

export const updateUserProgressAfterWorkout = async (userId, progressId, updates) => {
  // --- MODIFICATION: Path needs userId to be correct ---
  const docRef = doc(db, "users", userId, "user_lift_progress", progressId);
  try {
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating user progress: ", error);
    throw new Error("Could not update lift progress.");
  }
};

// --- USER SETTINGS FUNCTIONS ---

const defaultSettings = {
  barbellWeight: 45,
  legPressSledWeight: 75,
  increments: {
    squat: 5,
    'bench-press': 5,
    'barbell-row': 5,
    'overhead-press': 5,
    deadlift: 10,
  },
};

export const getUserSettings = async (userId) => {
  const settingsRef = doc(db, "users", userId, "settings", "userSettings");
  const docSnap = await getDoc(settingsRef);

  if (docSnap.exists()) {
    return { ...defaultSettings, ...docSnap.data() };
  } else {
    return defaultSettings;
  }
};

export const saveUserSettings = async (userId, settingsData) => {
  const settingsRef = doc(db, "users", userId, "settings", "userSettings");
  try {
    await setDoc(settingsRef, settingsData, { merge: true });
  } catch (error) {
    console.error("Error saving user settings:", error);
    throw new Error("Could not save settings.");
  }
};

export const resetLiftProgress = async (userId, liftId) => {
  const docRef = doc(db, "users", userId, "user_lift_progress", liftId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Could not find lift progress to reset.");
  }
  
  const defaultLift = defaultLifts.find(l => l.exerciseId === liftId);
  if (!defaultLift) {
    throw new Error("Default lift data not found.");
  }
  
  await updateDoc(docRef, {
    currentWeight: defaultLift.currentWeight,
    failureCount: 0,
  });
};

export const resetAllProgress = async (userId) => {
  const progressCol = collection(db, "users", userId, "user_lift_progress");
  const querySnapshot = await getDocs(progressCol);
  
  if (querySnapshot.empty) {
    return; // Nothing to reset
  }
  
  const batch = writeBatch(db);
  querySnapshot.forEach(doc => {
    const liftData = doc.data();
    const defaultLift = defaultLifts.find(l => l.exerciseId === liftData.exerciseId);
    if (defaultLift) {
      batch.update(doc.ref, {
        currentWeight: defaultLift.currentWeight,
        failureCount: 0,
      });
    }
  });
  
  await batch.commit();
};


export default app;