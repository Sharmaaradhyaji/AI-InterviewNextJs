import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA51itrwSj40ixkO8QWfUw3CXr4O6X_6As",
  authDomain: "prepwiseaiyt.firebaseapp.com",
  projectId: "prepwiseaiyt",
  storageBucket: "prepwiseaiyt.firebasestorage.app",
  messagingSenderId: "238683995939",
  appId: "1:238683995939:web:45d0c4e6212a65109f5696",
  measurementId: "G-Z2K3BP8XS9"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);