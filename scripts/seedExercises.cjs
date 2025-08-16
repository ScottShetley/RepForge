// Import the Firebase Admin SDK
const admin = require ('firebase-admin');

// Import your service account key
const serviceAccount = require ('./serviceAccountKey.json');

// -----------------------------------------------------------------------------
// !! IMPORTANT !!
// REPLACE THE DATABASE_URL BELOW WITH YOUR PROJECT'S DATABASE URL
// -----------------------------------------------------------------------------
admin.initializeApp ({
  credential: admin.credential.cert (serviceAccount),
  databaseURL: 'https://repforge-app-bd6f5.firebaseio.com', // <--- REPLACE THIS
});

// Get a reference to the Firestore database
const db = admin.firestore ();

// Define the exercise data with categories
const exercises = [
  // Core Lifts
  {name: 'Squat', coreLift: true, bodyPart: 'Legs', category: 'Squat'},
  {
    name: 'Bench Press',
    coreLift: true,
    bodyPart: 'Chest',
    category: 'Bench Press',
  },
  {
    name: 'Overhead Press',
    coreLift: true,
    bodyPart: 'Shoulders',
    category: 'Overhead Press',
  },
  {name: 'Deadlift', coreLift: true, bodyPart: 'Back', category: 'Deadlift'},
  {
    name: 'Barbell Row',
    coreLift: true,
    bodyPart: 'Back',
    category: 'Barbell Row',
  },

  // Squat Alternatives
  {name: 'Leg Press', coreLift: false, bodyPart: 'Legs', category: 'Squat'},
  {name: 'Goblet Squat', coreLift: false, bodyPart: 'Legs', category: 'Squat'},
  {
    name: 'Dumbbell Lunge',
    coreLift: false,
    bodyPart: 'Legs',
    category: 'Squat',
  },

  // Bench Press Alternatives
  {
    name: 'Dumbbell Bench Press',
    coreLift: false,
    bodyPart: 'Chest',
    category: 'Bench Press',
  },
  {
    name: 'Incline Bench Press',
    coreLift: false,
    bodyPart: 'Chest',
    category: 'Bench Press',
  },
  {name: 'Dips', coreLift: false, bodyPart: 'Chest', category: 'Bench Press'},
  {
    name: 'Push-ups',
    coreLift: false,
    bodyPart: 'Chest',
    category: 'Bench Press',
  },

  // Barbell Row Alternatives
  {
    name: 'Dumbbell Row',
    coreLift: false,
    bodyPart: 'Back',
    category: 'Barbell Row',
  },
  {
    name: 'Seated Cable Row',
    coreLift: false,
    bodyPart: 'Back',
    category: 'Barbell Row',
  },
  {
    name: 'T-Bar Row',
    coreLift: false,
    bodyPart: 'Back',
    category: 'Barbell Row',
  },

  // Overhead Press Alternatives
  {
    name: 'Seated Dumbbell Press',
    coreLift: false,
    bodyPart: 'Shoulders',
    category: 'Overhead Press',
  },
  {
    name: 'Arnold Press',
    coreLift: false,
    bodyPart: 'Shoulders',
    category: 'Overhead Press',
  },

  // Deadlift Alternatives
  {
    name: 'Romanian Deadlift',
    coreLift: false,
    bodyPart: 'Back',
    category: 'Deadlift',
  },
  {
    name: 'Sumo Deadlift',
    coreLift: false,
    bodyPart: 'Back',
    category: 'Deadlift',
  },

  // General Accessories
  {name: 'Pull-ups', coreLift: false, bodyPart: 'Back', category: 'Accessory'},
  {
    name: 'Lateral Raises',
    coreLift: false,
    bodyPart: 'Shoulders',
    category: 'Accessory',
  },
  {
    name: 'Face Pulls',
    coreLift: false,
    bodyPart: 'Shoulders',
    category: 'Accessory',
  },
  {
    name: 'Barbell Curls',
    coreLift: false,
    bodyPart: 'Arms',
    category: 'Accessory',
  },
  {
    name: 'Tricep Pushdowns',
    coreLift: false,
    bodyPart: 'Arms',
    category: 'Accessory',
  },
  {
    name: 'Hanging Knee Raises',
    coreLift: false,
    bodyPart: 'Core',
    category: 'Accessory',
  },
];

// Asynchronous function to seed the database
const seedDatabase = async () => {
  console.log ('Starting to seed the exercises collection...');
  try {
    const exerciseCollection = db.collection ('exercises');

    for (const exercise of exercises) {
      // Use the exercise name as the document ID for easier lookup if needed
      await exerciseCollection
        .doc (exercise.name.toLowerCase ().replace (/ /g, '-'))
        .set (exercise);
      console.log (`Successfully added: ${exercise.name}`);
    }
    console.log ('✅ Seeding completed successfully!');
  } catch (error) {
    console.error ('🔥 Error seeding database:', error);
  }
};

// Run the seeding function
seedDatabase ().then (() => {
  // Exit the script once seeding is done
  process.exit (0);
});
