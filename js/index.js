/*
 * TaxiDrive Web Application
 * Main JavaScript file for web-based functionality
 */

document.addEventListener("DOMContentLoaded", onPageReady, false);

function onPageReady() {
    console.log("TaxiDrive web application loaded successfully at:", new Date().toLocaleString());

    // Initialize app
    initApp();
}

function initApp() {
    // ================================
    // Variables
    // ================================
    let walletBalance = 0;
    let isLoggedIn = false;
    let userId = null;

    // Firebase references
    const auth = firebase.auth();
    const db = firebase.database();
    const storage = firebase.storage();

    // ================================
    // Helpers
    // ================================
    function isValidDataURL(str) {
        return str && str.startsWith("data:image/") && str.includes("base64,");
    }

    // ================================
    // Driver Licence + PrDP Expiry Notifications
    // ================================
    function checkDriverExpiryNotifications() {
        if (!userId) return;

        const now = new Date();
        const expiryThreshold = new Date(
            now.getTime() + 60 * 24 * 60 * 60 * 1000
        ); // 60 days from now

        // ✅ Use updated firebaseService listener
        firebaseService.onOwnerDriversChange((drivers) => {
            const driverList = drivers || [];

            driverList.forEach((driver) => {
                if (driver.licenceExpiry) {
                    const licenceExpiryDate = new Date(driver.licenceExpiry);
                    if (licenceExpiryDate <= expiryThreshold) {
                        alert(
                            `⚠️ Driver ${driver.name} ${driver.surname}'s licence expires soon on ${driver.licenceExpiry}`
                        );
                    }
                }
                if (driver.prdpExpiry) {
                    const prdpExpiryDate = new Date(driver.prdpExpiry);
                    if (prdpExpiryDate <= expiryThreshold) {
                        alert(
                            `⚠️ Driver ${driver.name} ${driver.surname}'s PrDP expires soon on ${driver.prdpExpiry}`
                        );
                    }
                }
            });
        });
    }

    // ================================
    // Firebase Auth State
    // ================================
    auth.onAuthStateChanged((user) => {
        if (user) {
            isLoggedIn = true;
            userId = user.uid;
            console.log("✅ User logged in:", user.email);

            // Run expiry check after login
            checkDriverExpiryNotifications();

            // TODO: other initialization (dashboard, wallet, etc.)
        } else {
            isLoggedIn = false;
            userId = null;
            console.log("ℹ️ User logged out");
        }
    });

    // ================================
    // Role Selection + Signup Modals
    // ================================
    const signupBtn = document.getElementById("signup-tab");
    const signupRoleModal = document.getElementById("signup-role-modal");
    const roleButtons = document.querySelectorAll(".signup-role-btn");
    const roleCancelBtn = document.getElementById("signup-role-cancel");

    // Open role selection modal
    if (signupBtn) {
        signupBtn.addEventListener("click", () => {
            if (signupRoleModal) signupRoleModal.style.display = "flex";
        });
    }

    // Cancel role selection
    if (roleCancelBtn) {
        roleCancelBtn.addEventListener("click", () => {
            signupRoleModal.style.display = "none";
        });
    }

    // Show appropriate signup modal based on role
    if (roleButtons) {
        roleButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const role = btn.dataset.role;
                signupRoleModal.style.display = "none";

                switch (role) {
                    case "association":
                        document.getElementById("signup-modal").style.display = "flex";
                        break;
                    case "driver":
                        document.getElementById("signup-driver-modal").style.display =
                            "flex";
                        break;
                    case "owner":
                        document.getElementById("signup-owner-modal").style.display =
                            "flex";
                        break;
                    case "passenger":
                        document.getElementById(
                            "signup-passenger-modal"
                        ).style.display = "flex";
                        break;
                }
            });
        });
    }
}
