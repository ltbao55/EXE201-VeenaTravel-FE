// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_vK9pcZQ7mTj6czOaoqtuswt3bXB8w84",
  authDomain: "veenatravel-448dd.firebaseapp.com",
  projectId: "veenatravel-448dd",
  storageBucket: "veenatravel-448dd.firebasestorage.app",
  messagingSenderId: "555989091333",
  appId: "1:555989091333:web:2e50260b67f8f637adc86c",
  measurementId: "G-34ZB5742VM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
