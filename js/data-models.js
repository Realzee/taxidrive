// Data Models for TaxiDrive Application
// Standardized data structures and validation

class DataModels {
    // Route model for Association app
    static createRoute(name, fare, maxVehicles, description = '') {
        return {
            name: name,
            fare: parseFloat(fare),
            maxVehicles: parseInt(maxVehicles),
            description: description,
            status: 'active', // active, inactive, suspended
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
        return errors;
    }

    // Vehicle model for Owner app
    static createVehicle(make, model, year, color, vin, engine, reg, licenseExpiry) {
        return {
            make: make,
            model: model,
            year: parseInt(year),
            color: color,
            vin: vin,
            engine: engine,
            reg: reg,
            licenseExpiry: licenseExpiry,
            status: 'active', // active, maintenance, inactive
            driverId: '', // assigned driver ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    static validateVehicle(vehicle) {
        const errors = [];
        if (!vehicle.make || vehicle.make.trim().length < 1) {
            errors.push('Vehicle make is required');
        }
        if (!vehicle.model || vehicle.model.trim().length < 1) {
            errors.push('Vehicle model is required');
        }
        if (!vehicle.year || vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 1) {
            errors.push('Invalid vehicle year');
        }
        if (!vehicle.reg || vehicle.reg.trim().length < 3) {
            errors.push('Registration number is required');
        }
        if (!vehicle.licenseExpiry || new Date(vehicle.licenseExpiry) < new Date()) {
            errors.push('License expiry date must be in the future');
        }
        return errors;
    }

    // Driver model for Owner app
    static createDriver(name, surname, cell, licenseType, licenseExpiry, email) {
        return {
            name: name,
            surname: surname,
            cell: cell,
            licenseType: licenseType,
            licenseExpiry: licenseExpiry,
            email: email,
            status: 'active', // active, inactive, suspended
            vehicleId: '', // assigned vehicle ID
            currentRoute: '', // current route ID
            dutyStatus: 'off', // on, off
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    static validateDriver(driver) {
        const errors = [];
        if (!driver.name || driver.name.trim().length < 2) {
            errors.push('Driver name must be at least 2 characters long');
        }
        if (!driver.surname || driver.surname.trim().length < 2) {
            errors.push('Driver surname must be at least 2 characters long');
        }
        if (!driver.cell || !/^\+?[\d\s-()]+$/.test(driver.cell)) {
            errors.push('Valid cell number is required');
        }
        if (!driver.licenseType || !['A', 'A1', 'C', 'C1', 'EB', 'EC1', 'EC'].includes(driver.licenseType)) {
            errors.push('Valid license type is required');
        }
        if (!driver.licenseExpiry || new Date(driver.licenseExpiry) < new Date()) {
            errors.push('License expiry date must be in the future');
        }
        if (!driver.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.email)) {
            errors.push('Valid email address is required');
        }
        return errors;
    }

    // Payment model
    static createPayment(fromUserId, toUserId, amount, route, type = 'passenger_payment') {
        return {
            fromUserId: fromUserId,
            toUserId: toUserId,
            amount: parseFloat(amount),
            route: route,
            type: type, // passenger_payment, top_up, transfer
            status: 'completed', // pending, completed, failed, refunded
            timestamp: new Date().toISOString()
        };
    }

    static validatePayment(payment) {
        const errors = [];
        if (!payment.fromUserId) {
            errors.push('From user ID is required');
        }
        if (!payment.toUserId) {
            errors.push('To user ID is required');
        }
        if (!payment.amount || payment.amount <= 0) {
            errors.push('Amount must be greater than 0');
        }
        if (!payment.route || payment.route.trim().length < 1) {
            errors.push('Route information is required');
        }
        return errors;
    }

    // Earning model
    static createEarning(amount, route, driver, type = 'passenger_payment') {
        return {
            amount: parseFloat(amount),
            route: route,
            driver: driver,
            type: type,
            timestamp: new Date().toISOString()
        };
    }

    // User profile model
    static createUserProfile(name, email, role) {
        return {
            name: name,
            email: email,
            role: role, // association, owner, driver, passenger
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    static validateUserProfile(profile) {
        const errors = [];
        if (!profile.name || profile.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
            errors.push('Valid email address is required');
        }
        if (!profile.role || !['association', 'owner', 'driver', 'passenger'].includes(profile.role)) {
            errors.push('Valid role is required');
        }
        return errors;
    }

    // Maintenance record model
    static createMaintenanceRecord(vehicleId, type, amount, description) {
        return {
            vehicleId: vehicleId,
            type: type, // repair, maintenance, fuel, toll
            amount: parseFloat(amount),
            description: description,
            date: new Date().toLocaleString(),
            recordedBy: firebaseService.getCurrentUser()?.uid || 'unknown'
        };
    }

    static validateMaintenance(maintenance) {
        const errors = [];
        if (!maintenance.vehicleId) {
            errors.push('Vehicle ID is required');
        }
        if (!maintenance.type || !['repair', 'maintenance', 'fuel', 'toll'].includes(maintenance.type)) {
            errors.push('Valid maintenance type is required');
        }
        if (!maintenance.amount || maintenance.amount <= 0) {
            errors.push('Amount must be greater than 0');
        }
        if (!maintenance.description || maintenance.description.trim().length < 5) {
            errors.push('Description must be at least 5 characters long');
        }
        return errors;
    }

    // Utility methods
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount);
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static calculateTotalEarnings(earnings) {
        if (!earnings || typeof earnings !== 'object') return 0;
        return Object.values(earnings).reduce((total, earning) => {
            return total + (parseFloat(earning.amount) || 0);
        }, 0);
    }

    static filterEarningsByPeriod(earnings, period = 'daily') {
        if (!earnings || typeof earnings !== 'object') return {};

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
                return earnings;
        }

        const filtered = {};
        Object.entries(earnings).forEach(([key, earning]) => {
            if (new Date(earning.timestamp) >= startDate) {
                filtered[key] = earning;
            }
        });

        return filtered;
    }
}
