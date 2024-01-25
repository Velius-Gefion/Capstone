import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAOa2-fM_hyoIlXb1cgSo8jaaGr3CPn5t8",
  authDomain: "capstone-e4aad.firebaseapp.com",
  projectId: "capstone-e4aad",
  storageBucket: "capstone-e4aad.appspot.com",
  messagingSenderId: "115584605615",
  appId: "1:115584605615:web:c7fbd8050807b8a522a35a",
  measurementId: "G-0F0BBR07JY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);