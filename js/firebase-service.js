// Firebase Service Module for TaxiDrive
// Centralized Firebase configuration and real-time database operations

class FirebaseService {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyDF4QoPKP02tFadu2pOVlcZRXaA5NcpmY0",
            authDomain: "taxidrive-337a3.firebaseapp.com",
            databaseURL: "https://taxidrive-337a3-default-rtdb.firebaseio.com",
            projectId: "taxidrive-337a3",
            storageBucket: "taxidrive-337a3.appspot.com",   // 👈 FIXED bucket URL
            messagingSenderId: "715498763019",
            appId: "1:715498763019:web:b9fb152a7d5411ebba680e",
            measurementId: "G-NB9PMBD7DQ"
        };

        this.app = null;
        this.auth = null;
        this.database = null;
        this.storage = null;   // 👈 add storage here
        this.currentUser = null;
        this.userRole = null;

        this.init();
    }

    init() {
        try {
            // Initialize Firebase only if not already initialized
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(this.firebaseConfig);
            } else {
                this.app = firebase.app();
            }

            this.auth = firebase.auth();
            this.database = firebase.database();
            this.storage = firebase.storage();   // 👈 initialize storage

            console.log('Firebase Service initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }

    // Example: Upload file to storage
    async uploadFile(path, file) {
        try {
            const storageRef = this.storage.ref(path);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return downloadURL;
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    // Example: Delete file from storage
    async deleteFile(path) {
        try {
            const storageRef = this.storage.ref(path);
            await storageRef.delete();
        } catch (error) {
            console.error('File delete error:', error);
            throw error;
        }
    }

    // ... 🔽 keep all your other existing methods unchanged
}

// Create singleton instance
const firebaseService = new FirebaseService();
