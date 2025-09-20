// Firebase Service Module for TaxiDrive
// Centralized Firebase configuration and real-time database operations

class FirebaseService {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyDF4QoPKP02tFadu2pOVlcZRXaA5NcpmY0",
            authDomain: "taxidrive-337a3.firebaseapp.com",
            databaseURL: "https://taxidrive-337a3-default-rtdb.firebaseio.com",
            projectId: "taxidrive-337a3",
            storageBucket: "taxidrive-337a3.firebasestorage.app",
            messagingSenderId: "715498763019",
            appId: "1:715498763019:web:b9fb152a7d5411ebba680e",
            measurementId: "G-NB9PMBD7DQ"
        };

        this.app = null;
        this.auth = null;
        this.database = null;
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

            console.log('Firebase Service initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }

    // Authentication methods
    async signUp(email, password, name, role) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Store user data in database
            await this.database.ref(`users/${user.uid}`).set({
                email: email,
                name: name,
                role: role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Update current user state
            this.currentUser = user;
            this.userRole = role;

            return user;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Get user data from database to update role
            const userSnapshot = await this.database.ref(`users/${user.uid}`).once('value');
            const userData = userSnapshot.val();

            // Update current user state
            this.currentUser = user;
            this.userRole = userData?.role || null;

            return user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;

            // Get user data from database to update role
            const userSnapshot = await this.database.ref(`users/${user.uid}`).once('value');
            const userData = userSnapshot.val();

            // Update current user state
            this.currentUser = user;
            this.userRole = userData?.role || null;

            return user;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            // Clear current user state
            this.currentUser = null;
            this.userRole = null;
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Real-time listeners
    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                // Get user role from database
                const userSnapshot = await this.database.ref(`users/${user.uid}`).once('value');
                this.userRole = userSnapshot.val()?.role || null;
            } else {
                this.userRole = null;
            }
            callback(user);
        });
    }

    // Route management (Association only)
    async addRoute(routeData) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can add routes');
        }

        try {
            const newRouteRef = this.database.ref('routes').push();
            await newRouteRef.set({
                ...routeData,
                id: newRouteRef.key,
                createdAt: new Date().toISOString(),
                status: 'active'
            });
            return newRouteRef.key;
        } catch (error) {
            console.error('Add route error:', error);
            throw error;
        }
    }

    async updateRoute(routeId, updates) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can update routes');
        }

        try {
            await this.database.ref(`routes/${routeId}`).update(updates);
        } catch (error) {
            console.error('Update route error:', error);
            throw error;
        }
    }

    onRoutesChange(callback) {
        return this.database.ref('routes').on('value', (snapshot) => {
            const routes = snapshot.val() || {};
            callback(routes);
        });
    }

    // Owner management
    async addVehicle(ownerId, vehicleData) {
        if (this.currentUser?.uid !== ownerId) {
            throw new Error('Unauthorized: Can only add vehicles to your own account');
        }

        try {
            const newVehicleRef = this.database.ref(`owners/${ownerId}/vehicles`).push();
            await newVehicleRef.set({
                ...vehicleData,
                id: newVehicleRef.key,
                createdAt: new Date().toISOString()
            });
            return newVehicleRef.key;
        } catch (error) {
            console.error('Add vehicle error:', error);
            throw error;
        }
    }

    async addDriver(ownerId, driverData) {
        if (this.currentUser?.uid !== ownerId) {
            throw new Error('Unauthorized: Can only add drivers to your own account');
        }

        try {
            const newDriverRef = this.database.ref(`owners/${ownerId}/drivers`).push();
            await newDriverRef.set({
                ...driverData,
                id: newDriverRef.key,
                createdAt: new Date().toISOString()
            });
            return newDriverRef.key;
        } catch (error) {
            console.error('Add driver error:', error);
            throw error;
        }
    }

    onOwnerVehiclesChange(ownerId, callback) {
        return this.database.ref(`owners/${ownerId}/vehicles`).on('value', (snapshot) => {
            const vehicles = snapshot.val() || {};
            callback(vehicles);
        });
    }

    onOwnerDriversChange(ownerId, callback) {
        return this.database.ref(`owners/${ownerId}/drivers`).on('value', (snapshot) => {
            const drivers = snapshot.val() || {};
            callback(drivers);
        });
    }

    onOwnerEarningsChange(ownerId, callback) {
        return this.database.ref(`owners/${ownerId}/earnings`).on('value', (snapshot) => {
            const earnings = snapshot.val() || {};
            callback(earnings);
        });
    }

    // Driver management
    async updateDriverRoute(driverId, routeId) {
        if (this.currentUser?.uid !== driverId) {
            throw new Error('Unauthorized: Can only update your own route');
        }

        try {
            await this.database.ref(`drivers/${driverId}/currentRoute`).set(routeId);
        } catch (error) {
            console.error('Update driver route error:', error);
            throw error;
        }
    }

    async updateDriverDutyStatus(driverId, status) {
        if (this.currentUser?.uid !== driverId) {
            throw new Error('Unauthorized: Can only update your own duty status');
        }

        try {
            await this.database.ref(`drivers/${driverId}/dutyStatus`).set(status);
        } catch (error) {
            console.error('Update duty status error:', error);
            throw error;
        }
    }

    onDriverDataChange(driverId, callback) {
        return this.database.ref(`drivers/${driverId}`).on('value', (snapshot) => {
            const driverData = snapshot.val() || {};
            callback(driverData);
        });
    }

    onDriverEarningsChange(driverId, callback) {
        return this.database.ref(`drivers/${driverId}/earnings`).on('value', (snapshot) => {
            const earnings = snapshot.val() || {};
            callback(earnings);
        });
    }

    // Passenger management
    async updateWalletBalance(passengerId, amount) {
        if (this.currentUser?.uid !== passengerId) {
            throw new Error('Unauthorized: Can only update your own wallet');
        }

        try {
            await this.database.ref(`passengers/${passengerId}/walletBalance`).set(amount);
        } catch (error) {
            console.error('Update wallet balance error:', error);
            throw error;
        }
    }

    async topUpWallet(passengerId, amount) {
        if (this.currentUser?.uid !== passengerId) {
            throw new Error('Unauthorized: Can only top up your own wallet');
        }

        try {
            await this.database.ref(`passengers/${passengerId}/walletBalance`).transaction((currentBalance) => {
                return (currentBalance || 0) + amount;
            });
        } catch (error) {
            console.error('Top up wallet error:', error);
            throw error;
        }
    }

    onPassengerDataChange(passengerId, callback) {
        return this.database.ref(`passengers/${passengerId}`).on('value', (snapshot) => {
            const passengerData = snapshot.val() || {};
            callback(passengerData);
        });
    }

    // Payment processing
    async processPayment(paymentData) {
        try {
            const newPaymentRef = this.database.ref('payments').push();
            await newPaymentRef.set({
                ...paymentData,
                id: newPaymentRef.key,
                timestamp: new Date().toISOString(),
                status: 'completed'
            });

            // Update passenger wallet balance
            if (paymentData.fromUserId && paymentData.amount) {
                await this.database.ref(`passengers/${paymentData.fromUserId}/walletBalance`).transaction((balance) => {
                    return (balance || 0) - paymentData.amount;
                });
            }

            // Add earnings to driver
            if (paymentData.toUserId && paymentData.amount) {
                await this.database.ref(`drivers/${paymentData.toUserId}/earnings`).push({
                    amount: paymentData.amount,
                    route: paymentData.route || 'Unknown',
                    timestamp: new Date().toISOString(),
                    type: 'passenger_payment'
                });
            }

            return newPaymentRef.key;
        } catch (error) {
            console.error('Process payment error:', error);
            throw error;
        }
    }

    onPaymentsChange(callback) {
        return this.database.ref('payments').on('value', (snapshot) => {
            const payments = snapshot.val() || {};
            callback(payments);
        });
    }

    // Utility methods
    getCurrentUser() {
        return this.currentUser;
    }

    getUserRole() {
        return this.userRole;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Cleanup listeners
    off(ref) {
        this.database.ref(ref).off();
    }
}

// Create singleton instance
const firebaseService = new FirebaseService();
