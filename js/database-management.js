// Database Management Module for TaxiDrive Association
// Provides comprehensive database clearing functionality

class DatabaseManagement {
    constructor(enhancedFirebaseService) {
        this.firebaseService = enhancedFirebaseService;
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;

        this.setupEventListeners();
        this.loadDatabaseStatus();
        this.isInitialized = true;
        console.log('Database Management initialized successfully');
    }

    setupEventListeners() {
        // Database status refresh
        const refreshStatusBtn = document.getElementById('refresh-status-btn');
        if (refreshStatusBtn) {
            refreshStatusBtn.addEventListener('click', () => this.loadDatabaseStatus());
        }

        // Clear specific data buttons
        this.setupClearButton('clear-users-btn', 'clearAllUsers', 'Clear All Users', 'users');
        this.setupClearButton('clear-routes-btn', 'clearAllRoutes', 'Clear All Routes', 'routes');
        this.setupClearButton('clear-trips-btn', 'clearAllTrips', 'Clear All Trips', 'trips');
        this.setupClearButton('clear-members-btn', 'clearAllMembers', 'Clear All Members', 'members');
        this.setupClearButton('clear-vehicles-btn', 'clearAllVehicles', 'Clear All Vehicles', 'vehicles');
        this.setupClearButton('clear-drivers-btn', 'clearAllDrivers', 'Clear All Drivers', 'drivers');
        this.setupClearButton('clear-payments-btn', 'clearAllPayments', 'Clear All Payments', 'payments');

        // Clear all data button
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.handleClearAll());
        }
    }

    setupClearButton(buttonId, methodName, title, dataType) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => this.handleClearData(methodName, title, dataType));
        }
    }

    handleClearData(methodName, title, dataType) {
        this.showConfirmation(
            title,
            'fas fa-exclamation-triangle',
            `Are you sure you want to clear all ${dataType} data? This action cannot be undone.`,
            'warning',
            async () => {
                try {
                    const result = await this.firebaseService[methodName]();
                    alert(result.message);
                    await this.loadDatabaseStatus();
                } catch (error) {
                    console.error(`Clear ${dataType} error:`, error);
                    alert(`Failed to clear ${dataType}: ${error.message}`);
                }
            }
        );
    }

    handleClearAll() {
        this.showConfirmation(
            'CLEAR ALL DATABASE DATA',
            'fas fa-exclamation-triangle',
            '⚠️ WARNING: This will permanently delete ALL data in the database including users, routes, trips, members, vehicles, drivers, and payments. This action CANNOT be undone. Are you absolutely sure?',
            'danger',
            async () => {
                try {
                    const result = await this.firebaseService.clearAllData();
                    alert(result.message);
                    await this.loadDatabaseStatus();
                } catch (error) {
                    console.error('Clear all data error:', error);
                    alert(`Failed to clear database: ${error.message}`);
                }
            }
        );
    }

    async loadDatabaseStatus() {
        try {
            const status = await this.firebaseService.getDatabaseStatus();
            this.updateDatabaseStatusUI(status);
        } catch (error) {
            console.error('Load database status error:', error);
            alert(`Failed to load database status: ${error.message}`);
        }
    }

    updateDatabaseStatusUI(status) {
        const elements = {
            'status-users': status.users,
            'status-routes': status.routes,
            'status-trips': status.trips,
            'status-members': status.members,
            'status-vehicles': status.vehicles,
            'status-drivers': status.drivers,
            'status-payments': status.payments,
            'status-timestamp': new Date(status.timestamp).toLocaleString()
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    showConfirmation(title, iconClass, message, type = 'primary', onConfirm) {
        // Use the existing confirmation modal system
        if (typeof showConfirmation === 'function') {
            showConfirmation(title, iconClass, message, type, onConfirm);
        } else {
            // Fallback to browser confirm
            if (confirm(`${title}\n\n${message}`)) {
                onConfirm();
            }
        }
    }
}

// Create singleton instance
let databaseManagement;

function initializeDatabaseManagement() {
    if (typeof enhancedFirebaseService !== 'undefined') {
        databaseManagement = new DatabaseManagement(enhancedFirebaseService);
        databaseManagement.initialize();
    } else {
        console.warn('Enhanced Firebase Service not available for database management');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDatabaseManagement();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManagement;
}
