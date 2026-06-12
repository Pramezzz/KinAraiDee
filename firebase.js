import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjOKNZSeI7CvXe6zJnHgyGIg_0yecRxLo",
    authDomain: "kinaraidee-b911a.firebaseapp.com",
    projectId: "kinaraidee-b911a",
    storageBucket: "kinaraidee-b911a.firebasestorage.app",
    messagingSenderId: "109922961032",
    appId: "1:109922961032:web:37eddc36a0913729d6813d",
    measurementId: "G-ZV14R02P7Y"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);