// Enhanced Data Models for TaxiDrive Application
// Extended functionality for comprehensive route management

class EnhancedDataModels {
    // Enhanced Route model for Association app
    static createRoute(name, fare, maxVehicles, description = '', status = 'active') {
        return {
            name: name,
            fare: parseFloat(fare),
            maxVehicles: parseInt(maxVehicles),
            description: description,
            status: status, // active, inactive, suspended
            vehicles: 0, // current number of assigned vehicles
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Enhanced fields for better route management
            origin: '',
            destination: '',
            distance: 0, // in kilometers
            estimatedDuration: 0, // in minutes
            operatingHours: {
                start: '05:00',
                end: '22:00'
            },
            assignedVehicles: [], // array of vehicle IDs
            assignedDrivers: [], // array of driver IDs
            performance: {
                totalTrips: 0,
                totalRevenue: 0,
                averageOccupancy: 0,
                lastUpdated: new Date().toISOString()
            }
        };
    }

    static validateRoute(route) {
        const errors = [];
        if (!route.name || route.name.trim().length < 2) {
            errors.push('Route name must be at least 2 characters long');
        }
        if (!route.fare || route.fare <= 0) {
            errors.push('Fare must be greater than 0');
        }
        if (!route.maxVehicles || route.maxVehicles < 1) {
            errors.push('Maximum vehicles must be at least 1');
        }
        if (route.description && route.description.length > 100) {
            errors.push('Description must not exceed 100 characters');
        }
        if (!['active', 'inactive', 'suspended'].includes(route.status)) {
            errors.push('Status must be active, inactive, or suspended');
        }
        if (route.distance && (route.distance < 0 || route.distance > 1000)) {
            errors.push('Distance must be between 0 and 1000 kilometers');
        }
        if (route.estimatedDuration && (route.estimatedDuration < 1 || route.estimatedDuration > 480)) {
            errors.push('Estimated duration must be between 1 and 480 minutes');
        }
        return errors;
    }

    // Enhanced route utility methods
    static updateRoutePerformance(routeId, tripData) {
        return {
            totalTrips: (tripData.totalTrips || 0) + 1,
            totalRevenue: (tripData.totalRevenue || 0) + (tripData.fare || 0),
            averageOccupancy: this.calculateAverageOccupancy(tripData),
            lastUpdated: new Date().toISOString()
        };
    }

    static calculateAverageOccupancy(tripData) {
        if (!tripData || !tripData.passengers || !tripData.capacity) {
            return 0;
        }
        return (tripData.passengers / tripData.capacity) * 100;
    }

    static getRouteStatusColor(status) {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'inactive': return '#FF9800';
            case 'suspended': return '#F44336';
            default: return '#2196F3';
        }
    }

    static getRouteStatusText(status) {
        switch (status) {
            case 'active': return 'Active';
            case 'inactive': return 'Inactive';
            case 'suspended': return 'Suspended';
            default: return 'Unknown';
        }
    }

    static filterRoutesByStatus(routes, status) {
        if (status === 'all') return routes;
        return Object.fromEntries(
            Object.entries(routes).filter(([id, route]) => route.status === status)
        );
    }

    static searchRoutes(routes, searchTerm) {
        if (!searchTerm) return routes;
        const term = searchTerm.toLowerCase();
        return Object.fromEntries(
            Object.entries(routes).filter(([id, route]) =>
                route.name?.toLowerCase().includes(term) ||
                route.description?.toLowerCase().includes(term) ||
                route.origin?.toLowerCase().includes(term) ||
                route.destination?.toLowerCase().includes(term)
            )
        );
    }

    static filterRoutesByFare(routes, minFare, maxFare) {
        return Object.fromEntries(
            Object.entries(routes).filter(([id, route]) => {
                const fare = parseFloat(route.fare) || 0;
                return fare >= minFare && fare <= maxFare;
            })
        );
    }

    static getRouteStatistics(routes) {
        const routesArray = Object.values(routes);
        const activeRoutes = routesArray.filter(route => route.status === 'active').length;
        const totalVehicles = routesArray.reduce((sum, route) => sum + (route.vehicles || 0), 0);
        const totalRevenue = routesArray.reduce((sum, route) => sum + (route.performance?.totalRevenue || 0), 0);
        const averageOccupancy = routesArray.length > 0
            ? routesArray.reduce((sum, route) => sum + (route.performance?.averageOccupancy || 0), 0) / routesArray.length
            : 0;

        return {
            totalRoutes: routesArray.length,
            activeRoutes,
            inactiveRoutes: routesArray.filter(route => route.status === 'inactive').length,
            suspendedRoutes: routesArray.filter(route => route.status === 'suspended').length,
            totalVehicles,
            totalRevenue,
            averageOccupancy: Math.round(averageOccupancy * 100) / 100
        };
    }

    // Route assignment methods
    static assignVehicleToRoute(routeId, vehicleId) {
        return {
            routeId,
            vehicleId,
            assignedAt: new Date().toISOString(),
            status: 'active'
        };
    }

    static assignDriverToRoute(routeId, driverId) {
        return {
            routeId,
            driverId,
            assignedAt: new Date().toISOString(),
            status: 'active'
        };
    }

    static removeAssignment(routeId, entityId, type = 'vehicle') {
        return {
            routeId,
            entityId,
            type, // 'vehicle' or 'driver'
            removedAt: new Date().toISOString()
        };
    }

    // Bulk operations
    static bulkUpdateRouteStatus(routes, newStatus) {
        const updates = {};
        Object.keys(routes).forEach(routeId => {
            updates[`${routeId}/status`] = newStatus;
            updates[`${routeId}/updatedAt`] = new Date().toISOString();
        });
        return updates;
    }

    static bulkDeleteRoutes(routes) {
        const deleteOperations = {};
        Object.keys(routes).forEach(routeId => {
            deleteOperations[routeId] = null;
        });
        return deleteOperations;
    }

    // Export/Import utilities
    static exportRoutesToJSON(routes) {
        return JSON.stringify(routes, null, 2);
    }

    static validateImportedRoute(routeData) {
        const errors = [];
        if (!routeData.name || typeof routeData.name !== 'string') {
            errors.push('Route name is required and must be a string');
        }
        if (!routeData.fare || typeof routeData.fare !== 'number' || routeData.fare <= 0) {
            errors.push('Route fare is required and must be a positive number');
        }
        if (!routeData.maxVehicles || typeof routeData.maxVehicles !== 'number' || routeData.maxVehicles < 1) {
            errors.push('Max vehicles is required and must be at least 1');
        }
        return errors;
    }

    // Analytics and reporting
    static generateRouteReport(routes, period = 'monthly') {
        const stats = this.getRouteStatistics(routes);
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
                startDate = new Date(2020, 0, 1); // Default to beginning
        }

        const recentRoutes = Object.fromEntries(
            Object.entries(routes).filter(([id, route]) =>
                new Date(route.createdAt) >= startDate
            )
        );

        return {
            period,
            generatedAt: new Date().toISOString(),
            summary: stats,
            recentRoutes: Object.keys(recentRoutes).length,
            topRoutes: this.getTopPerformingRoutes(routes, 5)
        };
    }

    static getTopPerformingRoutes(routes, limit = 5) {
        return Object.entries(routes)
            .sort(([,a], [,b]) => (b.performance?.totalRevenue || 0) - (a.performance?.totalRevenue || 0))
            .slice(0, limit)
            .map(([id, route]) => ({
                id,
                name: route.name,
                revenue: route.performance?.totalRevenue || 0,
                trips: route.performance?.totalTrips || 0
            }));
    }
}
