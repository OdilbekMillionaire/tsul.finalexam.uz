import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCnjZeHLvjkoH8HMw_sOyDmP-iGUtxRMHY",
  authDomain: "finalexam-f7f60.firebaseapp.com",
  projectId: "finalexam-f7f60",
  storageBucket: "finalexam-f7f60.firebasestorage.app",
  messagingSenderId: "263758982682",
  appId: "1:263758982682:web:7dcaee290175232696aba3",
  measurementId: "G-ZSVHT8PRF2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
