import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOa2-fM_hyoIlXb1cgSo8jaaGr3CPn5t8",
  authDomain: "capstone-e4aad.firebaseapp.com",
  projectId: "capstone-e4aad",
  storageBucket: "capstone-e4aad.appspot.com",
  messagingSenderId: "115584605615",
  appId: "1:115584605615:web:d81c08b1cf155f1922a35a",
  measurementId: "G-96KXNX3XXK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth =getAuth(app);
export const googleProvider = GoogleAuthProvider(app);
const analytics = getAnalytics(app);