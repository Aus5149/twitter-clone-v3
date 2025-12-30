// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApb5IauwaF_vPznqnNI75f1_EnjYxQ9sU",
  authDomain: "twitter-app-5de71.firebaseapp.com",
  projectId: "twitter-app-5de71",
  storageBucket: "twitter-app-5de71.firebasestorage.app",
  messagingSenderId: "96807714994",
  appId: "1:96807714994:web:ad677d969507cc8fad09ab"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)