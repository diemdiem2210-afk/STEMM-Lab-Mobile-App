import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByxfvcgBc0FJE-Axd-I9wcjjgspSKkyUY",
  authDomain: "stemm-lab-mobile-app.firebaseapp.com",
  projectId: "stemm-lab-mobile-app",
  storageBucket: "stemm-lab-mobile-app.firebasestorage.app",
  messagingSenderId: "959486924935",
  appId: "1:959486924935:web:13dfaa29a29f585dd78022",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);