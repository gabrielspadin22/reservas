import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB130nvJI3TIntwiKBdqo1rMNhtFROQ_zw",
    authDomain: "reservas-pn.firebaseapp.com",
    databaseURL: "https://reservas-pn-default-rtdb.firebaseio.com",
    projectId: "reservas-pn",
    storageBucket: "reservas-pn.appspot.com",
    messagingSenderId: "922309275800",
    appId: "1:922309275800:web:8a13096668b0295bb720ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);