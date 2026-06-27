import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyASOQFbg7dO-8_RAsDhtZKNxQXYGJQUpW8",
  authDomain: "winner-2026.firebaseapp.com",
  projectId: "winner-2026",
  storageBucket: "winner-2026.firebasestorage.app",
  messagingSenderId: "830195720782",
  appId: "1:830195720782:web:d8be1bdf271846a45d991f",
  measurementId: "G-3T7HN58HH0"
};

// הפעלת האפליקציה וחיבור לשירותי ענן
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
