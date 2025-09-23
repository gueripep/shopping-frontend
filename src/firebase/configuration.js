// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjsoSbq_t-kxsPPazZdGknFpI2143qrRM",
  authDomain: "gueripep.firebaseapp.com",
  projectId: "gueripep",
  storageBucket: "gueripep.firebasestorage.app",
  messagingSenderId: "640739834165",
  appId: "1:640739834165:web:5b612ac1404b6ab126347c",
  measurementId: "G-26ZBG61PYX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;