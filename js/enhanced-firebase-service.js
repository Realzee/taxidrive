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
}

// Create singleton instance
const enhancedFirebaseService = new EnhancedFirebaseService();
