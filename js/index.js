/*
 * TaxiDrive Web Application
 * Main JavaScript file for web-based functionality
 */

document.addEventListener('DOMContentLoaded', onPageReady, false);

function onPageReady() {
    console.log('TaxiDrive web application loaded successfully at:', new Date().toLocaleString());

    // Initialize Firebase and app logic here
    initApp();
}

function initApp() {
    // Firebase config and initialization moved here if needed

    // Variables
    let walletBalance = 0;
    let isLoggedIn = false;
    let userId = null;

    // Firebase auth and database references
    const auth = firebase.auth();
    const db = firebase.database();
    const storage = firebase.storage();

    // Function to check if a string is a valid data URL
    function isValidDataURL(str) {
        return str && str.startsWith('data:image/') && str.includes('base64,');
    }

    // Add your app functions here, e.g., updateEarningsHistory, updateFleetOverview, updateDriverManagement, etc.
    // Implement the TODO notifications for licence and PrDP expiry

    // Notification for licence and PrDP expiry within 60 days
    function checkDriverExpiryNotifications() {
        if (!userId) return;
        const now = new Date();
        const expiryThreshold = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now

        // Use reactive listener for drivers data
        firebaseService.onOwnerDriversChange(userId, (drivers) => {
            drivers = drivers || {};
            Object.entries(drivers).forEach(([driverId, driver]) => {
                if (driver.licenceExpiry) {
                    const licenceExpiryDate = new Date(driver.licenceExpiry);
                    if (licenceExpiryDate <= expiryThreshold) {
                        alert(`Driver ${driver.name} ${driver.surname}'s licence expires soon on ${driver.licenceExpiry}`);
                    }
                }
                if (driver.prdpExpiry) {
                    const prdpExpiryDate = new Date(driver.prdpExpiry);
                    if (prdpExpiryDate <= expiryThreshold) {
                        alert(`Driver ${driver.name} ${driver.surname}'s PrDP expires soon on ${driver.prdpExpiry}`);
                    }
                }
            });
        });
    }

    // Call checkDriverExpiryNotifications on auth state change
    auth.onAuthStateChanged(user => {
        if (user) {
            isLoggedIn = true;
            userId = user.uid;
            checkDriverExpiryNotifications();
            // Other initialization code...
        } else {
            isLoggedIn = false;
            userId = null;
        }
    });

    // ================================
    // Role Selection + Signup Modals
    // ================================
    const signupBtn = document.getElementById("signup-tab");
    const signupRoleModal = document.getElementById("signup-role-modal"); // NEW modal
    const roleButtons = document.querySelectorAll(".signup-role-btn"); // buttons inside role selection modal
    const roleCancelBtn = document.getElementById("signup-role-cancel");

    // Open role selection modal instead of directly showing signup
    signupBtn.addEventListener("click", () => {
        if (signupRoleModal) signupRoleModal.style.display = "flex";
    });

    // Cancel role selection
    if (roleCancelBtn) {
        roleCancelBtn.addEventListener("click", () => {
            signupRoleModal.style.display = "none";
        });
    }

    // Show the appropriate signup modal based on role
    if (roleButtons) {
        roleButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const role = btn.dataset.role;
                signupRoleModal.style.display = "none";

                switch (role) {
                    case "association":
                        document.getElementById("signup-modal").style.display = "flex";
                        break;
                    case "driver":
                        document.getElementById("signup-driver-modal").style.display = "flex";
                        break;
                    case "owner":
                        document.getElementById("signup-owner-modal").style.display = "flex";
                        break;
                    case "passenger":
                        document.getElementById("signup-passenger-modal").style.display = "flex";
                        break;
                }
            });
        });
    }
}
