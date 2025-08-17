import React, {useState, useEffect} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {auth, createUserProfile, getUserProfile} from '../services/firebase.js';
import {AuthContext} from './AuthContext'; // Import the context from the new file

export function AuthProvider({children}) {
  const [currentUser, setCurrentUser] = useState (null);
  const [userProfile, setUserProfile] = useState (null);
  const [loading, setLoading] = useState (true);

  async function signup (email, password) {
    const userCredential = await createUserWithEmailAndPassword (
      auth,
      email,
      password
    );
    await createUserProfile (userCredential.user);
    return userCredential;
  }

  function login (email, password) {
    return signInWithEmailAndPassword (auth, email, password);
  }

  function logout () {
    setUserProfile (null);
    return signOut (auth);
  }

  async function refreshUserProfile () {
    if (currentUser) {
      const profile = await getUserProfile (currentUser.uid);
      setUserProfile (profile);
    }
  }

  useEffect (() => {
    const unsubscribe = onAuthStateChanged (auth, async user => {
      setCurrentUser (user);
      if (user) {
        let profile = await getUserProfile (user.uid);
        if (!profile) {
          await createUserProfile (user);
          profile = await getUserProfile (user.uid);
        }
        setUserProfile (profile);
      }
      setLoading (false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
