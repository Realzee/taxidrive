// Firebase Service Module for TaxiDrive
// Centralized Firebase configuration, authentication, storage, and database operations

class FirebaseService {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyDF4QoPKP02tFadu2pOVlcZRXaA5NcpmY0",
            authDomain: "taxidrive-337a3.firebaseapp.com",
            databaseURL: "https://taxidrive-337a3-default-rtdb.firebaseio.com",
            projectId: "taxidrive-337a3",
            storageBucket: "taxidrive-337a3.appspot.com",
            messagingSenderId: "715498763019",
            appId: "1:715498763019:web:b9fb152a7d5411ebba680e",
            measurementId: "G-NB9PMBD7DQ"
        };

        this.app = null;
        this.auth = null;
        this.database = null;
        this.storage = null;
        this.currentUser = null;
        this.userRole = null;

        this.init();
    }

    init() {
        try {
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(this.firebaseConfig);
            } else {
                this.app = firebase.app();
            }

            this.auth = firebase.auth();
            this.database = firebase.database();
            this.storage = firebase.storage();

            // Watch authentication state
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user || null;
                if (user) {
                    console.log("User logged in:", user.email);
                } else {
                    console.log("No user logged in");
                }
            });

            console.log("Firebase Service initialized successfully");
        } catch (error) {
            console.error("Firebase initialization error:", error);
            throw error;
        }
    }

    // 🔹 AUTH METHODS
    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            return userCredential.user;
        } catch (error) {
            console.error("Sign-in error:", error);
            throw error;
        }
    }

    async signOutUser() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            console.log("User signed out successfully");
        } catch (error) {
            console.error("Sign-out error:", error);
            throw error;
        }
    }

    async registerUser(email, password, role = "Passenger") {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;

            // Save user role in DB
            await this.database.ref("users/" + uid).set({
                email,
                role
            });

            return userCredential.user;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    }

    // 🔹 DATABASE METHODS
    async writeData(path, data) {
        try {
            await this.database.ref(path).set(data);
            console.log("Data written successfully:", path);
        } catch (error) {
            console.error("Database write error:", error);
            throw error;
        }
    }

    async readData(path) {
        try {
            const snapshot = await this.database.ref(path).once("value");
            return snapshot.val();
        } catch (error) {
            console.error("Database read error:", error);
            throw error;
        }
    }

    // 🔹 STORAGE METHODS
    async uploadFile(path, file) {
        try {
            const storageRef = this.storage.ref(path);
            const snapshot = await storageRef.put(file);
            return await snapshot.ref.getDownloadURL();
        } catch (error) {
            console.error("File upload error:", error);
            throw error;
        }
    }

    async deleteFile(path) {
        try {
            const storageRef = this.storage.ref(path);
            await storageRef.delete();
            console.log("File deleted:", path);
        } catch (error) {
            console.error("File delete error:", error);
            throw error;
        }
    }
}

// Create singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
