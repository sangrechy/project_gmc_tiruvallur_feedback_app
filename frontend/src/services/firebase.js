// Firebase Client SDK initialization with graceful decoupling
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Detect if user configured valid Firebase keys
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "" &&
  !firebaseConfig.apiKey.includes("YOUR_")
);

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("🟢 Firebase initialized successfully for project:", firebaseConfig.projectId);
  } catch (err) {
    console.warn("⚠️ Firebase initialization failed, falling back to Demo Mode:", err.message);
  }
} else {
  console.info("ℹ️ Running in Local Demo Mode (Firebase credentials not detected). All features are fully interactive with local storage!");
}

export { app, db, auth };
