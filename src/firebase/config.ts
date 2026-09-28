import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// The web app's Firebase configuration provided for project equinova-f54a7
export const defaultFirebaseConfig = {
  apiKey: "AIzaSyDhh79mRmJu573fDPWh4H9pSTBi_SjzIGc",
  authDomain: "equinova-f54a7.firebaseapp.com",
  projectId: "equinova-f54a7",
  storageBucket: "equinova-f54a7.firebasestorage.app",
  messagingSenderId: "1078962630551",
  appId: "1:1078962630551:web:6b0c6b3035e00f91ecded2"
};

// Check for custom config saved in localStorage (optional override for testing)
const storedConfig = typeof window !== "undefined" ? localStorage.getItem("equinova_custom_firebase_config") : null;
export const firebaseConfig = storedConfig ? JSON.parse(storedConfig) : defaultFirebaseConfig;

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore
export const db = getFirestore(app);

export const saveCustomConfig = (newConfig: typeof defaultFirebaseConfig) => {
  localStorage.setItem("equinova_custom_firebase_config", JSON.stringify(newConfig));
  window.location.reload();
};

export const resetToDefaultConfig = () => {
  localStorage.removeItem("equinova_custom_firebase_config");
  window.location.reload();
};
