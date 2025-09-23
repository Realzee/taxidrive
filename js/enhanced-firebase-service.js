// Enhanced Firebase Service Module for TaxiDrive
// Extended functionality for comprehensive route management

class EnhancedFirebaseService {
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

            console.log('Enhanced Firebase Service initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }

    // Owner approval methods
    async fetchPendingOwners() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can fetch pending owners');
        }
        try {
            const snapshot = await this.database.ref('users').orderByChild('associationApproved').equalTo(false).once('value');
            const users = snapshot.val() || {};
            // Filter for users with role 'owner'
            const pendingOwners = Object.fromEntries(
                Object.entries(users).filter(([id, user]) => user.role === 'owner')
            );
            return pendingOwners;
        } catch (error) {
            console.error('Fetch pending owners error:', error);
            throw error;
        }
    }

    async fetchOwnerDocuments(ownerId) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can fetch owner documents');
        }
        try {
            const snapshot = await this.database.ref(`documents/${ownerId}`).once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Fetch owner documents error:', error);
            throw error;
        }
    }

    async updateOwnerApprovalStatus(ownerId, status, feedback = '') {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can update owner approval status');
        }
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            throw new Error('Invalid approval status');
        }
        try {
            const updates = {
                associationApproved: status === 'approved',
                approvalStatus: status,
                updatedAt: new Date().toISOString()
            };

            if (feedback) {
                updates.associationFeedback = feedback;
            }

            await this.database.ref(`users/${ownerId}`).update(updates);

            // Log the approval action
            await this.database.ref(`associations/${this.currentUser.uid}/approvalHistory/${ownerId}`).set({
                action: status,
                timestamp: new Date().toISOString(),
                feedback: feedback,
                ownerId: ownerId
            });

        } catch (error) {
            console.error('Update owner approval status error:', error);
            throw error;
        }
    }

    // Member approval methods (keeping for backward compatibility)
    async fetchPendingMembers() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can fetch pending members');
        }
        try {
            const snapshot = await this.database.ref('members').orderByChild('approvalStatus').equalTo('pending').once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Fetch pending members error:', error);
            throw error;
        }
    }

    async fetchMemberDocuments(memberId) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can fetch member documents');
        }
        try {
            const snapshot = await this.database.ref(`memberDocuments/${memberId}`).once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Fetch member documents error:', error);
            throw error;
        }
    }

    async updateMemberApprovalStatus(memberId, status) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can update member approval status');
        }
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            throw new Error('Invalid approval status');
        }
        try {
            await this.database.ref(`members/${memberId}`).update({
                approvalStatus: status,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Update member approval status error:', error);
            throw error;
        }
    }

    // Enhanced Route management (Association only)
    async addRoute(routeData) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can add routes');
        }

        try {
            const newRouteRef = this.database.ref('routes').push();
            const enhancedRouteData = {
                ...routeData,
                id: newRouteRef.key,
                createdAt: new Date().toISOString(),
                status: routeData.status || 'active',
                performance: {
                    totalTrips: 0,
                    totalRevenue: 0,
                    averageOccupancy: 0,
                    lastUpdated: new Date().toISOString()
                }
            };

            await newRouteRef.set(enhancedRouteData);
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
            const enhancedUpdates = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await this.database.ref(`routes/${routeId}`).update(enhancedUpdates);
        } catch (error) {
            console.error('Update route error:', error);
            throw error;
        }
    }

    async deleteRoute(routeId) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can delete routes');
        }

        try {
            await this.database.ref(`routes/${routeId}`).remove();
        } catch (error) {
            console.error('Delete route error:', error);
            throw error;
        }
    }

    // Bulk route operations
    async bulkUpdateRoutes(routeIds, updates) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can perform bulk updates');
        }

        try {
            const batchUpdates = {};
            const timestamp = new Date().toISOString();

            routeIds.forEach(routeId => {
                batchUpdates[`routes/${routeId}`] = {
                    ...updates,
                    updatedAt: timestamp
                };
            });

            await this.database.ref().update(batchUpdates);
        } catch (error) {
            console.error('Bulk update routes error:', error);
            throw error;
        }
    }

    async bulkDeleteRoutes(routeIds) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can perform bulk deletes');
        }

        try {
            const deletePromises = routeIds.map(routeId =>
                this.database.ref(`routes/${routeId}`).remove()
            );

            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Bulk delete routes error:', error);
            throw error;
        }
    }

    // Route assignment operations
    async assignVehicleToRoute(routeId, vehicleId) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can assign vehicles');
        }

        try {
            // Add vehicle to route's assigned vehicles
            await this.database.ref(`routes/${routeId}/assignedVehicles`).transaction(vehicles => {
                const vehicleArray = vehicles || [];
                if (!vehicleArray.includes(vehicleId)) {
                    vehicleArray.push(vehicleId);
                }
                return vehicleArray;
            });

            // Update vehicle's assigned route
            await this.database.ref(`vehicles/${vehicleId}`).update({
                assignedRoute: routeId,
                updatedAt: new Date().toISOString()
            });

            // Update route's vehicle count
            await this.database.ref(`routes/${routeId}/vehicles`).transaction(count => {
                return (count || 0) + 1;
            });

        } catch (error) {
            console.error('Assign vehicle to route error:', error);
            throw error;
        }
    }

    async assignDriverToRoute(routeId, driverId) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can assign drivers');
        }

        try {
            // Add driver to route's assigned drivers
            await this.database.ref(`routes/${routeId}/assignedDrivers`).transaction(drivers => {
                const driverArray = drivers || [];
                if (!driverArray.includes(driverId)) {
                    driverArray.push(driverId);
                }
                return driverArray;
            });

            // Update driver's assigned route
            await this.database.ref(`drivers/${driverId}`).update({
                assignedRoute: routeId,
                updatedAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Assign driver to route error:', error);
            throw error;
        }
    }

    async removeVehicleFromRoute(routeId, vehicleId) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can remove vehicle assignments');
        }

        try {
            // Remove vehicle from route's assigned vehicles
            await this.database.ref(`routes/${routeId}/assignedVehicles`).transaction(vehicles => {
                if (vehicles) {
                    return vehicles.filter(id => id !== vehicleId);
                }
                return [];
            });

            // Clear vehicle's assigned route
            await this.database.ref(`vehicles/${vehicleId}`).update({
                assignedRoute: null,
                updatedAt: new Date().toISOString()
            });

            // Update route's vehicle count
            await this.database.ref(`routes/${routeId}/vehicles`).transaction(count => {
                return Math.max((count || 0) - 1, 0);
            });

        } catch (error) {
            console.error('Remove vehicle from route error:', error);
            throw error;
        }
    }

    async removeDriverFromRoute(routeId, driverId) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can remove driver assignments');
        }

        try {
            // Remove driver from route's assigned drivers
            await this.database.ref(`routes/${routeId}/assignedDrivers`).transaction(drivers => {
                if (drivers) {
                    return drivers.filter(id => id !== driverId);
                }
                return [];
            });

            // Clear driver's assigned route
            await this.database.ref(`drivers/${driverId}`).update({
                assignedRoute: null,
                updatedAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Remove driver from route error:', error);
            throw error;
        }
    }

    // Route analytics and reporting
    async getRouteAnalytics(routeId, period = 'monthly') {
        try {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'daily':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'weekly':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'monthly':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    break;
                default:
                    startDate = new Date(2020, 0, 1);
            }

            // Get route data
            const routeSnapshot = await this.database.ref(`routes/${routeId}`).once('value');
            const route = routeSnapshot.val();

            if (!route) {
                throw new Error('Route not found');
            }

            // Get trips for this route in the period
            const tripsSnapshot = await this.database.ref('trips')
                .orderByChild('routeId')
                .equalTo(routeId)
                .once('value');

            const trips = tripsSnapshot.val() || {};
            const periodTrips = Object.fromEntries(
                Object.entries(trips).filter(([id, trip]) =>
                    new Date(trip.timestamp) >= startDate
                )
            );

            // Calculate analytics
            const analytics = {
                routeId,
                routeName: route.name,
                period,
                totalTrips: Object.keys(periodTrips).length,
                totalRevenue: Object.values(periodTrips).reduce((sum, trip) => sum + (trip.fare || 0), 0),
                averageFare: Object.keys(periodTrips).length > 0
                    ? Object.values(periodTrips).reduce((sum, trip) => sum + (trip.fare || 0), 0) / Object.keys(periodTrips).length
                    : 0,
                assignedVehicles: route.assignedVehicles?.length || 0,
                assignedDrivers: route.assignedDrivers?.length || 0,
                performance: route.performance || {}
            };

            return analytics;
        } catch (error) {
            console.error('Get route analytics error:', error);
            throw error;
        }
    }

    // Real-time listeners for enhanced functionality
    onRoutesChange(callback) {
        return this.database.ref('routes').on('value', (snapshot) => {
            const routes = snapshot.val() || {};
            callback(routes);
        });
    }

    onRouteAssignmentsChange(routeId, callback) {
        return this.database.ref(`routes/${routeId}/assignments`).on('value', (snapshot) => {
            const assignments = snapshot.val() || {};
            callback(assignments);
        });
    }

    onRoutePerformanceChange(routeId, callback) {
        return this.database.ref(`routes/${routeId}/performance`).on('value', (snapshot) => {
            const performance = snapshot.val() || {};
            callback(performance);
        });
    }

    // Search and filtering
    async searchRoutes(searchTerm, filters = {}) {
        try {
            const routesSnapshot = await this.database.ref('routes').once('value');
            const routes = routesSnapshot.val() || {};

            let filteredRoutes = { ...routes };

            // Apply search term
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredRoutes = Object.fromEntries(
                    Object.entries(filteredRoutes).filter(([id, route]) =>
                        route.name?.toLowerCase().includes(term) ||
                        route.description?.toLowerCase().includes(term) ||
                        route.origin?.toLowerCase().includes(term) ||
                        route.destination?.toLowerCase().includes(term)
                    )
                );
            }

            // Apply status filter
            if (filters.status && filters.status !== 'all') {
                filteredRoutes = Object.fromEntries(
                    Object.entries(filteredRoutes).filter(([id, route]) =>
                        route.status === filters.status
                    )
                );
            }

            // Apply fare range filter
            if (filters.minFare || filters.maxFare) {
                filteredRoutes = Object.fromEntries(
                    Object.entries(filteredRoutes).filter(([id, route]) => {
                        const fare = parseFloat(route.fare) || 0;
                        const minFare = parseFloat(filters.minFare) || 0;
                        const maxFare = parseFloat(filters.maxFare) || Infinity;
                        return fare >= minFare && fare <= maxFare;
                    })
                );
            }

            return filteredRoutes;
        } catch (error) {
            console.error('Search routes error:', error);
            throw error;
        }
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

    // Database Clearing Methods (Association only)
    async clearAllUsers() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can clear user data');
        }

        try {
            console.log('Starting to clear all users...');
            await this.database.ref('users').remove();
            console.log('All users cleared successfully');
            return { success: true, message: 'All users cleared successfully' };
        } catch (error) {
            console.error('Clear users error:', error);
            throw error;
        }
    }

    async clearAllRoutes() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can clear route data');
        }

        try {
            console.log('Starting to clear all routes...');
            await this.database.ref('routes').remove();
            console.log('All routes cleared successfully');
            return { success: true, message: 'All routes cleared successfully' };
        } catch (error) {
            console.error('Clear routes error:', error);
            throw error;
        }
    }

    async clearAllTrips() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can clear trip data');
        }

        try {
            console.log('Starting to clear all trips...');
            await this.database.ref('trips').remove();
            console.log('All trips cleared successfully');
            return { success: true, message: 'All trips cleared successfully' };
        } catch (error) {
            console.error('Clear trips error:', error);
            throw error;
        }
    }

    async clearAllMembers() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can clear member data');
        }

        try {
            console.log('Starting to clear all members...');
            await this.database.ref('members').remove();
            await this.database.ref('memberDocuments').remove();
            console.log('All members and member documents cleared successfully');
            return { success: true, message: 'All members and member documents cleared successfully' };
        } catch (error) {
            console.error('Clear members error:', error);
            throw error;
        }
    }

    async clearAllVehicles() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can clear vehicle data');
        }

        try {
            console.log('Starting to clear all vehicles...');
            await this.database.ref('vehicles').remove();
            console.log('All vehicles cleared successfully');
            return { success: true, message: 'All vehicles cleared successfully' };
        } catch (error) {
            console.error('Clear vehicles error:', error);
            throw error;
        }
    }

    async clearAllDrivers() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can clear driver data');
        }

        try {
            console.log('Starting to clear all drivers...');
            await this.database.ref('drivers').remove();
            console.log('All drivers cleared successfully');
            return { success: true, message: 'All drivers cleared successfully' };
        } catch (error) {
            console.error('Clear drivers error:', error);
            throw error;
        }
    }

    async clearAllPayments() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can clear payment data');
        }

        try {
            console.log('Starting to clear all payments...');
            await this.database.ref('payments').remove();
            console.log('All payments cleared successfully');
            return { success: true, message: 'All payments cleared successfully' };
        } catch (error) {
            console.error('Clear payments error:', error);
            throw error;
        }
    }

    async clearAllData() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can perform complete database clear');
        }

        try {
            console.log('Starting complete database clear...');
            const clearPromises = [
                this.database.ref('users').remove(),
                this.database.ref('routes').remove(),
                this.database.ref('trips').remove(),
                this.database.ref('members').remove(),
                this.database.ref('memberDocuments').remove(),
                this.database.ref('vehicles').remove(),
                this.database.ref('drivers').remove(),
                this.database.ref('payments').remove(),
                this.database.ref('owners').remove(),
                this.database.ref('passengers').remove(),
                this.database.ref('associations').remove()
            ];

            await Promise.all(clearPromises);
            console.log('Complete database clear finished successfully');
            return { success: true, message: 'Complete database clear finished successfully' };
        } catch (error) {
            console.error('Complete database clear error:', error);
            throw error;
        }
    }

    // Registered/Approved Owners Management Methods
    async fetchApprovedOwners() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can fetch approved owners');
        }
        try {
            const snapshot = await this.database.ref('users').orderByChild('associationApproved').equalTo(true).once('value');
            const users = snapshot.val() || {};
            // Filter for users with role 'owner'
            const approvedOwners = Object.fromEntries(
                Object.entries(users).filter(([id, user]) => user.role === 'owner')
            );
            return approvedOwners;
        } catch (error) {
            console.error('Fetch approved owners error:', error);
            throw error;
        }
    }

    async updateOwnerDetails(ownerId, updates) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can update owner details');
        }
        try {
            const enhancedUpdates = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await this.database.ref(`users/${ownerId}`).update(enhancedUpdates);

            // Log the update action
            await this.database.ref(`associations/${this.currentUser.uid}/ownerUpdates/${ownerId}`).set({
                updates: updates,
                timestamp: new Date().toISOString(),
                ownerId: ownerId
            });

        } catch (error) {
            console.error('Update owner details error:', error);
            throw error;
        }
    }

    async getAssociations() {
        try {
            const snapshot = await this.database.ref('users').orderByChild('role').equalTo('association').once('value');
            const associations = snapshot.val() || {};
            return Object.fromEntries(
                Object.entries(associations).map(([id, association]) => [
                    id,
                    {
                        id: id,
                        name: association.name || 'Unnamed Association',
                        email: association.email || 'N/A'
                    }
                ])
            );
        } catch (error) {
            console.error('Get associations error:', error);
            throw error;
        }
    }

    // Database Status and Information Methods
    async getDatabaseStatus() {
        try {
            const status = {
                users: 0,
                routes: 0,
                trips: 0,
                members: 0,
                vehicles: 0,
                drivers: 0,
                payments: 0,
                timestamp: new Date().toISOString()
            };

            const promises = [
                this.database.ref('users').once('value').then(snapshot => status.users = snapshot.numChildren()),
                this.database.ref('routes').once('value').then(snapshot => status.routes = snapshot.numChildren()),
                this.database.ref('trips').once('value').then(snapshot => status.trips = snapshot.numChildren()),
                this.database.ref('members').once('value').then(snapshot => status.members = snapshot.numChildren()),
                this.database.ref('vehicles').once('value').then(snapshot => status.vehicles = snapshot.numChildren()),
                this.database.ref('drivers').once('value').then(snapshot => status.drivers = snapshot.numChildren()),
                this.database.ref('payments').once('value').then(snapshot => status.payments = snapshot.numChildren())
            ];

            await Promise.all(promises);
            return status;
        } catch (error) {
            console.error('Get database status error:', error);
            throw error;
        }
    }

    // Owner Registration Methods
    async validateOwnerRegistration(ownerData) {
        const errors = [];

        // Required fields validation
        if (!ownerData.name || ownerData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!ownerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.email)) {
            errors.push('Valid email address is required');
        }

        if (!ownerData.phone || ownerData.phone.trim().length < 10) {
            errors.push('Valid phone number is required');
        }

        if (!ownerData.idNumber || ownerData.idNumber.trim().length < 5) {
            errors.push('Valid ID number is required');
        }

        if (!ownerData.address || ownerData.address.trim().length < 10) {
            errors.push('Valid address is required');
        }

        // Check for duplicate email
        try {
            const usersSnapshot = await this.database.ref('users').orderByChild('email').equalTo(ownerData.email).once('value');
            if (usersSnapshot.exists()) {
                errors.push('An account with this email already exists');
            }
        } catch (error) {
            console.error('Error checking for duplicate email:', error);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    async registerNewOwner(ownerData) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can register new owners');
        }

        try {
            // Validate owner data
            const validation = await this.validateOwnerRegistration(ownerData);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Generate secure password
            const tempPassword = this.generateSecurePassword();

            // Create Firebase Auth account
            const userCredential = await this.auth.createUserWithEmailAndPassword(ownerData.email, tempPassword);

            // Set up owner profile in database
            const ownerProfile = {
                uid: userCredential.user.uid,
                name: ownerData.name.trim(),
                email: ownerData.email.toLowerCase().trim(),
                phone: ownerData.phone.trim(),
                idNumber: ownerData.idNumber.trim(),
                address: ownerData.address.trim(),
                role: 'owner',
                status: 'active',
                associationId: this.currentUser.uid,
                associationName: await this.getAssociationName(),
                associationApproved: true,
                approvalStatus: 'approved',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                registeredBy: this.currentUser.uid,
                emailVerified: false,
                loginEnabled: true
            };

            // Save to users collection
            await this.database.ref(`users/${userCredential.user.uid}`).set(ownerProfile);

            // Log registration activity
            await this.database.ref(`associations/${this.currentUser.uid}/ownerRegistrations/${userCredential.user.uid}`).set({
                ownerId: userCredential.user.uid,
                ownerName: ownerData.name,
                ownerEmail: ownerData.email,
                timestamp: new Date().toISOString(),
                tempPassword: tempPassword
            });

            return {
                success: true,
                ownerId: userCredential.user.uid,
                tempPassword: tempPassword,
                message: 'Owner registered successfully'
            };

        } catch (error) {
            console.error('Register new owner error:', error);
            throw error;
        }
    }

    async sendOwnerCredentials(ownerEmail, tempPassword, ownerName) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can send credentials');
        }

        try {
            // In a real application, you would use a proper email service
            // For now, we'll simulate email sending and log the credentials
            console.log('=== OWNER CREDENTIALS ===');
            console.log(`Email: ${ownerEmail}`);
            console.log(`Temporary Password: ${tempPassword}`);
            console.log(`Name: ${ownerName}`);
            console.log('======================');

            // Store credentials for the association to access
            await this.database.ref(`associations/${this.currentUser.uid}/pendingCredentials/${Date.now()}`).set({
                ownerEmail: ownerEmail,
                tempPassword: tempPassword,
                ownerName: ownerName,
                sentAt: new Date().toISOString(),
                status: 'sent'
            });

            return {
                success: true,
                message: 'Credentials logged successfully. In production, these would be emailed to the owner.'
            };

        } catch (error) {
            console.error('Send owner credentials error:', error);
            throw error;
        }
    }

    async setupOwnerProfile(ownerId, additionalData = {}) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can setup owner profiles');
        }

        try {
            const profileData = {
                ...additionalData,
                updatedAt: new Date().toISOString(),
                profileCompleted: true
            };

            await this.database.ref(`users/${ownerId}`).update(profileData);

            return {
                success: true,
                message: 'Owner profile setup completed'
            };

        } catch (error) {
            console.error('Setup owner profile error:', error);
            throw error;
        }
    }

    generateSecurePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    async getAssociationName() {
        try {
            const snapshot = await this.database.ref(`users/${this.currentUser.uid}`).once('value');
            const userData = snapshot.val();
            return userData?.name || 'Unknown Association';
        } catch (error) {
            console.error('Error getting association name:', error);
            return 'Unknown Association';
        }
    }

    // Owner Registration Audit and Security Methods
    async getOwnerRegistrationHistory(limit = 50) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can view registration history');
        }

        try {
            const snapshot = await this.database.ref(`associations/${this.currentUser.uid}/ownerRegistrations`)
                .orderByChild('timestamp')
                .limitToLast(limit)
                .once('value');

            return snapshot.val() || {};
        } catch (error) {
            console.error('Get owner registration history error:', error);
            throw error;
        }
    }

    async getPendingCredentials() {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can view pending credentials');
        }

        try {
            const snapshot = await this.database.ref(`associations/${this.currentUser.uid}/pendingCredentials`)
                .orderByChild('sentAt')
                .once('value');

            return snapshot.val() || {};
        } catch (error) {
            console.error('Get pending credentials error:', error);
            throw error;
        }
    }

    async clearOldCredentials(daysOld = 30) {
        if (this.userRole !== 'association') {
            throw new Error('Unauthorized: Only associations can clear credentials');
        }

        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const snapshot = await this.database.ref(`associations/${this.currentUser.uid}/pendingCredentials`)
                .orderByChild('sentAt')
                .endAt(cutoffDate.toISOString())
                .once('value');

            const oldCredentials = snapshot.val() || {};
            const deletePromises = Object.keys(oldCredentials).map(key =>
                this.database.ref(`associations/${this.currentUser.uid}/pendingCredentials/${key}`).remove()
            );

            await Promise.all(deletePromises);

            return {
                success: true,
                deletedCount: Object.keys(oldCredentials).length,
                message: `Cleared ${Object.keys(oldCredentials).length} old credential records`
            };

        } catch (error) {
            console.error('Clear old credentials error:', error);
            throw error;
        }
    }
}

// Create singleton instance
const enhancedFirebaseService = new EnhancedFirebaseService();
