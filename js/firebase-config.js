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

// Initialize Firebase safely
let app;
try {
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        app = firebase.app();
    }
    
    // Get database reference
    const database = firebase.database();

    // Configure auth persistence to local
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(error => {
            console.error('Firebase persistence error:', error);
        });
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Handle initialization error (show user-friendly message if needed)
}
