import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAuSAJNKtudSpIg1Z4CKp5DpJsvUrIUPnk",
  authDomain: "ngxcbb-84108.firebaseapp.com",
  projectId: "ngxcbb-84108",
  storageBucket: "ngxcbb-84108.firebasestorage.app",
  messagingSenderId: "506280326599",
  appId: "1:506280326599:web:1c2332f9554127d60755e2",
  measurementId: "G-LCH1Z5JMVX"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
