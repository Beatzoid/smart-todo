// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQ9kpdckLoT8nh_KHMQqmds4_yfCFKz80",
    authDomain: "smart-todo-c3e2d.firebaseapp.com",
    projectId: "smart-todo-c3e2d",
    storageBucket: "smart-todo-c3e2d.appspot.com",
    messagingSenderId: "539577070533",
    appId: "1:539577070533:web:325190c289e9f5edcbd1ac"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
