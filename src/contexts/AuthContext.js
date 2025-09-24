import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/configuration';
import {
  useInitialize,
  useVisitorCode,
  useData,
  CustomData,
} from '@kameleoon/react-sdk';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const { initialize } = useInitialize();
  const { getVisitorCode } = useVisitorCode();
  const { addData, flush } = useData();

  const setCurrentUserAndSetCustomData = useCallback(async (user) => {
    setCurrentUser(user); 

    try {
      await initialize();
      const visitorCode = getVisitorCode();
      
      // Create custom data with user ID for cross-device tracking
      const userId = user.uid;
      if(!userId) return;
      console.log('Setting Kameleoon custom data for user ID:', user);
      const customData = new CustomData('user_id', userId );
      
      // Add the custom data to Kameleoon
      addData(visitorCode, customData);
      
      // Flush the data immediately to ensure it's sent to Kameleoon servers
      flush({ visitorCode, instant: true });
    } catch (error) {
      console.error('Error setting Kameleoon data:', error);
    }
  }, [initialize, getVisitorCode, addData, flush]);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  function signup(email, password, displayName) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        // Update the user's display name
        if (displayName) {
          return updateProfile(result.user, {
            displayName: displayName
          });
        }
        return result;
      });
  }

  // Sign in with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Sign in with Google
  function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  // Sign out
  function logout() {
    return signOut(auth);
  }

  // Reset password
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Update email
  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  // Update password
  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserAndSetCustomData(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [setCurrentUserAndSetCustomData]);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}