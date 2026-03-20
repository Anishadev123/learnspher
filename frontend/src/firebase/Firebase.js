import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8sKlccn6Nmlow7HI0OHX9HMnIwHKU5zc",
  authDomain: "learnsphere-a4af1.firebaseapp.com",
  projectId: "learnsphere-a4af1",
  storageBucket: "learnsphere-a4af1.firebasestorage.app",
  messagingSenderId: "223534955103",
  appId: "1:223534955103:web:421e8e27b214fa7e56f9ea"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };