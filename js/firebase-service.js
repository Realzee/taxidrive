// Firebase Service Module for TaxiDrive
// Centralized Firebase configuration and real-time database operations

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

            console.log("✅ Firebase Service initialized");
        } catch (error) {
            console.error("❌ Firebase initialization error:", error);
            throw error;
        }
    }

    // --- Auth ---
    async signUp(email, password) {
        return await this.auth.createUserWithEmailAndPassword(email, password);
    }

    async signIn(email, password) {
        return await this.auth.signInWithEmailAndPassword(email, password);
    }

    async signOut() {
        return await this.auth.signOut();
    }

    // --- Database ---
    async saveData(path, data) {
        return await this.database.ref(path).set(data);
    }

    async pushData(path, data) {
        return await this.database.ref(path).push(data);
    }

    async getData(path) {
        const snapshot = await this.database.ref(path).once("value");
        return snapshot.val();
    }

    // --- Storage ---
    async uploadFile(path, file) {
        const storageRef = this.storage.ref(path);
        const snapshot = await storageRef.put(file);
        return await snapshot.ref.getDownloadURL();
    }

    async deleteFile(path) {
        const storageRef = this.storage.ref(path);
        await storageRef.delete();
    }
}

// Create singleton
const firebaseService = new FirebaseService();

// 👇 Attach to global window so index.js & inline scripts can use it
window.firebaseService = firebaseService;
