// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAaJx-7t4lTk_Ke2p-C-4pk8v1AwKAMcVo",
    authDomain: "bdsql-9416f.firebaseapp.com",
    databaseURL: "https://bdsql-9416f-default-rtdb.firebaseio.com",
    projectId: "bdsql-9416f",
    storageBucket: "bdsql-9416f.appspot.com",
    messagingSenderId: "839033499435",
    appId: "1:839033499435:web:5d870bee99a6d4d8ca5f6e",
    measurementId: "G-LTD31T7MYY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();
