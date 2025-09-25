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
import { pushUserStatus, pushLogoutEvent } from '../utils/gtm';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { initialize } = useInitialize();
  const { getVisitorCode } = useVisitorCode();
  const { addData, flush } = useData();

  const setCurrentUserAndSetCustomData = useCallback(async (user) => {
    setCurrentUser(user); 

    // Push user status to GTM dataLayer (without login event for page loads)
    if (isInitialLoad) {
      pushUserStatus(user ? user.uid : null);
    }

    try {
      await initialize();
      const visitorCode = getVisitorCode();
      
      // Create custom data with user ID for cross-device tracking
      if (user && user.uid) {
        console.log('Setting Kameleoon custom data for user ID:', user);
        const customData = new CustomData('user_id', user.uid);
        
        // Add the custom data to Kameleoon
        addData(visitorCode, customData);
        
        // Flush the data immediately to ensure it's sent to Kameleoon servers
        flush({ visitorCode, instant: true });
      }
    } catch (error) {
      console.error('Error setting Kameleoon data:', error);
    }
  }, [initialize, getVisitorCode, addData, flush, isInitialLoad]);
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
    // Push logout event to GTM dataLayer
    pushLogoutEvent();
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
      // After the first auth state change, no longer initial load
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    });

    return unsubscribe;
  }, [setCurrentUserAndSetCustomData, isInitialLoad]);

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