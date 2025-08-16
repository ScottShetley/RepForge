import React, {useContext, useState, useEffect} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
// --- MODIFIED LINE ---
import {auth} from '../services/firebase.js'; // Added .js extension

// Create the context
const AuthContext = React.createContext ();

// Custom hook to consume the context easily
export function useAuth () {
  return useContext (AuthContext);
}

// Provider component that will wrap the application
export function AuthProvider({children}) {
  const [currentUser, setCurrentUser] = useState (null);
  const [loading, setLoading] = useState (true);

  // --- AUTHENTICATION FUNCTIONS ---
  function signup (email, password) {
    return createUserWithEmailAndPassword (auth, email, password);
  }

  function login (email, password) {
    return signInWithEmailAndPassword (auth, email, password);
  }

  function logout () {
    return signOut (auth);
  }

  // --- AUTH STATE OBSERVER ---
  useEffect (() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged (auth, user => {
      setCurrentUser (user);
      setLoading (false); // Set loading to false once we have the user status
    });

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  // The value provided to the context consumers
  const value = {
    currentUser,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render the app until the user status has been checked */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
