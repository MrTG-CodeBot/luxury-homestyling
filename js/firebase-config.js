/**
 * LUXURY HOMESTYLING - FIREBASE & IMAGEKIT CONFIGURATION
 */

const LUXURY_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBfo10ehz14yfjHn0xGe_d3Bl-TiMeVOis",
  authDomain: "luxuryhome-2b8b3.firebaseapp.com",
  projectId: "luxuryhome-2b8b3",
  storageBucket: "luxuryhome-2b8b3.firebasestorage.app",
  messagingSenderId: "304350040697",
  appId: "1:304350040697:web:0ae2e6b9e5390e68ed3aa8",
  measurementId: "G-N8D8XXTMTN"
};

const LUXURY_IMAGEKIT_CONFIG = {
  publicKey: "public_+UakMhQEG9oqkCM3AEsiXKW7SZM=",
  urlEndpoint: "https://ik.imagekit.io/luxuryhome/", // customizable in settings
  privateKeySample: "private_Wl6cmsEfoJNlVNjIbyyirr0f1Rk="
};

// Export to window scope
window.LUXURY_FIREBASE_CONFIG = LUXURY_FIREBASE_CONFIG;
window.LUXURY_IMAGEKIT_CONFIG = LUXURY_IMAGEKIT_CONFIG;
