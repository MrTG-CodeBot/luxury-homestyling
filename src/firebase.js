/**
 * LUXURY HOMESTYLING - MODULAR FIREBASE INITIALIZATION
 * Curtains • Blinds • Carpets • Wallpapers | Kerala Doorstep Service
 * Firebase Project: luxuryhome-2b8b3
 */
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfo10ehz14yfjHn0xGe_d3Bl-TiMeVOis",
  authDomain: "luxuryhome-2b8b3.firebaseapp.com",
  projectId: "luxuryhome-2b8b3",
  storageBucket: "luxuryhome-2b8b3.firebasestorage.app",
  messagingSenderId: "304350040697",
  appId: "1:304350040697:web:0ae2e6b9e5390e68ed3aa8",
  measurementId: "G-N8D8XXTMTN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Firebase Analytics safely for browser environments
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("📊 Firebase Analytics initialized successfully");
    }
  }).catch(() => {});
}

export default app;

