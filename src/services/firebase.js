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
  getDoc,
  deleteDoc
} from "firebase/firestore";

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

// --- USER PROFILE FUNCTIONS ---
export const createUserProfile = async (user) => {
  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      isSetupComplete: false,
      createdAt: serverTimestamp(),
    });
  } catch (error)
 {
    console.error("Error creating user profile:", error);
  }
};

export const getUserProfile = async (uid) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

export const updateUserProfile = async (uid, updates) => {
    const userRef = doc(db, "users", uid);
    try {
        await updateDoc(userRef, updates);
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
};

// --- EXERCISE LIBRARY FUNCTIONS ---
export const getAllExercises = async () => {
  try {
    const exercisesCol = collection(db, "exercises");
    const q = query(exercisesCol);
    const querySnapshot = await getDocs(q);
    const exercises = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return exercises;
  } catch (error) {
    console.error("Error fetching all exercises: ", error);
    throw new Error("Could not fetch exercises.");
  }
};

export const getExercisesByCategory = async (category) => {
  try {
    const exercisesCol = collection(db, "exercises");
    const q = query(exercisesCol, where("category", "==", category));
    const querySnapshot = await getDocs(q);
    const exercises = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return exercises;
  } catch (error) {
    console.error("Error fetching exercises by category: ", error);
    throw new Error("Could not fetch exercises.");
  }
};

// --- WORKOUT SESSION FUNCTIONS ---
export const saveWorkoutSession = async (userId, workoutData) => {
  const getBadge = (value, thresholds, lowerIsBetter) => {
    if (lowerIsBetter) {
      if (value <= thresholds.gold) return 'gold';
      if (value <= thresholds.silver) return 'silver';
      if (value <= thresholds.bronze) return 'bronze';
    } else {
      if (value >= thresholds.gold) return 'gold';
      if (value >= thresholds.silver) return 'silver';
      if (value >= thresholds.bronze) return 'bronze';
    }
    return 'none';
  };

  try {
    const dataToSave = {
      userId: userId,
      ...workoutData,
      createdAt: serverTimestamp(),
    };

    if (workoutData.workoutType === 'circuit') {
      const { totalTimeInSeconds, exercisesCompleted } = workoutData;
      
      dataToSave.timeBadge = getBadge(
        totalTimeInSeconds, 
        { gold: 1800, silver: 2700, bronze: 3600 }, 
        true
      );
      
      dataToSave.exerciseBadge = getBadge(
        exercisesCompleted, 
        { gold: 14, silver: 10, bronze: 7 }, 
        false
      );
    }

    const docRef = await addDoc(collection(db, "workout_sessions"), dataToSave);
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
    const q = query(workoutsCol, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const workouts = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    return workouts;
  } catch (error) {
    console.error("Error fetching workouts: ", error);
    throw new Error("Could not fetch workout history.");
  }
};

export const deleteWorkout = async (workoutId) => {
  try {
    const workoutRef = doc(db, "workout_sessions", workoutId);
    await deleteDoc(workoutRef);
  } catch (error) {
    console.error("Error deleting workout: ", error);
    throw new Error("Could not delete workout session.");
  }
};

export const getLastWorkout = async (userId) => {
  try {
    const workoutsCol = collection(db, "workout_sessions");
    const q = query(workoutsCol, where("userId", "==", userId), where("workoutType", "==", "5x5"), orderBy("createdAt", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0].data();
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
  { exerciseId: 'seated-cable-row', name: 'Seated Cable Row', currentWeight: 45, increment: 5, failureCount: 0 },
];

export const createInitialUserProgress = async (userId, baselineWeights) => {
  const progressColRef = collection(db, 'users', userId, 'user_lift_progress');
  const batch = writeBatch(db);
  for (const exerciseId in baselineWeights) {
    const defaultLift = defaultLifts.find(lift => lift.exerciseId === exerciseId);
    const docRef = doc(progressColRef, exerciseId);
    const liftData = {
      userId,
      exerciseId,
      name: defaultLift ? defaultLift.name : exerciseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      currentWeight: baselineWeights[exerciseId],
      increment: defaultLift ? defaultLift.increment : 5,
      failureCount: 0,
      baselineWeight: baselineWeights[exerciseId],
    };
    batch.set(docRef, liftData);
  }
  await batch.commit();
};

export const getUserProgress = async (userId) => {
  const progressCol = collection(db, "users", userId, "user_lift_progress");
  const q = query(progressCol);
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return {};
  const userProgress = {};
  querySnapshot.docs.forEach(doc => {
    userProgress[doc.id] = { id: doc.id, ...doc.data() }; 
  });
  return userProgress;
};

export const updateUserProgressAfterWorkout = async (userId, progressId, updates) => {
  // --- FIX: Add validation to prevent sending invalid data (undefined or NaN) ---
  for (const key in updates) {
    const value = updates[key];
    if (value === undefined || Number.isNaN(value)) {
      const errorMessage = `Attempted to save invalid value for lift ${progressId}. Field: ${key}, Value: ${value}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

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
  weightIncrement: 5,
  deloadPercentage: 10,
  increments: {
    squat: 5, 'bench-press': 5, 'barbell-row': 5, 'overhead-press': 5, deadlift: 10,
  },
};

export const getUserSettings = async (userId) => {
  const settingsRef = doc(db, "users", userId, "settings", "userSettings");
  const docSnap = await getDoc(settingsRef);
  if (docSnap.exists()) {
    return { ...defaultSettings, ...docSnap.data() };
  } else {
    await saveUserSettings(userId, defaultSettings);
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

export const resetProgressToBaseline = async (userId) => {
    const progressCol = collection(db, "users", userId, "user_lift_progress");
    const querySnapshot = await getDocs(progressCol);
    if (querySnapshot.empty) return;
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
        const liftData = doc.data();
        if (liftData.baselineWeight !== undefined) {
            batch.update(doc.ref, { currentWeight: liftData.baselineWeight, failureCount: 0 });
        }
    });
    await batch.commit();
};

export const resetLiftProgress = async (userId, liftId) => {
  const docRef = doc(db, "users", userId, "user_lift_progress", liftId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Could not find lift progress to reset.");
  const defaultLift = defaultLifts.find(l => l.exerciseId === liftId);
  if (!defaultLift) throw new Error("Default lift data not found.");
  await updateDoc(docRef, { currentWeight: defaultLift.currentWeight, failureCount: 0 });
};

export const resetAllProgress = async (userId) => {
  const progressCol = collection(db, "users", userId, "user_lift_progress");
  const querySnapshot = await getDocs(progressCol);
  if (querySnapshot.empty) return;
  const batch = writeBatch(db);
  querySnapshot.forEach(doc => {
    const liftData = doc.data();
    const defaultLift = defaultLifts.find(l => l.exerciseId === liftData.exerciseId);
    if (defaultLift) {
      batch.update(doc.ref, { currentWeight: defaultLift.currentWeight, failureCount: 0 });
    }
  });
  await batch.commit();
};

export default app;