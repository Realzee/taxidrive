/*
 * TaxiDrive Web Application
 * Main JavaScript file for web-based functionality
 */

document.addEventListener('DOMContentLoaded', onPageReady, false);

function onPageReady() {
    console.log('TaxiDrive web application loaded successfully at:', new Date().toLocaleString());
    initApp();
}

function initApp() {
    let walletBalance = 0;
    let isLoggedIn = false;
    let userId = null;

    const auth = firebase.auth();

    // ============================
    // AUTH STATE LISTENER
    // ============================
    auth.onAuthStateChanged(user => {
        if (user) {
            isLoggedIn = true;
            userId = user.uid;
            console.log("✅ Logged in as:", userId);

            // Save/update user profile
            firebaseService.saveData(`users/${userId}`, {
                email: user.email,
                lastLogin: new Date().toISOString()
            }).catch(err => console.error("❌ Failed to save user:", err));

            // Start driver expiry notifications
            checkDriverExpiryNotifications(userId);
        } else {
            console.log("⚠️ No user logged in");
            isLoggedIn = false;
            userId = null;
        }
    });

    // ============================
    // SIGNUP HANDLERS
    // ============================
    const signupAssociationForm = document.getElementById("signup-association");
    if (signupAssociationForm) {
        signupAssociationForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = e.target["email"].value;
            const password = e.target["password"].value;

            try {
                const cred = await firebaseService.signUp(email, password);
                const uid = cred.user.uid;
                console.log("✅ Association signed up:", uid);

                await firebaseService.saveData(`users/${uid}`, {
                    email,
                    role: "association",
                    createdAt: new Date().toISOString()
                });

                alert("Association account created successfully!");
                e.target.reset();
                document.getElementById("signup-modal").style.display = "none";
            } catch (err) {
                console.error("❌ Signup error:", err);
                alert("Signup failed: " + err.message);
            }
        });
    }

    // ============================
    // LOGIN HANDLER
    // ============================
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = e.target["email"].value;
            const password = e.target["password"].value;

            try {
                const cred = await firebaseService.signIn(email, password);
                const uid = cred.user.uid;
                console.log("✅ Logged in as:", uid);

                alert("Login successful!");
                loginForm.reset();
            } catch (err) {
                console.error("❌ Login error:", err);
                alert("Login failed: " + err.message);
            }
        });
    }

    // ============================
    // DRIVER EXPIRY NOTIFICATIONS
    // ============================
    function checkDriverExpiryNotifications(ownerId) {
        if (!ownerId) return;
        const now = new Date();
        const expiryThreshold = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

        firebaseService.onOwnerDriversChange((drivers) => {
            drivers = drivers || [];
            drivers.forEach(driver => {
                if (driver.licenceExpiry) {
                    const licenceExpiryDate = new Date(driver.licenceExpiry);
                    if (licenceExpiryDate <= expiryThreshold) {
                        alert(`⚠️ Driver ${driver.name} ${driver.surname}'s licence expires on ${driver.licenceExpiry}`);
                    }
                }
                if (driver.prdpExpiry) {
                    const prdpExpiryDate = new Date(driver.prdpExpiry);
                    if (prdpExpiryDate <= expiryThreshold) {
                        alert(`⚠️ Driver ${driver.name} ${driver.surname}'s PrDP expires on ${driver.prdpExpiry}`);
                    }
                }
            });
        });
    }

    // ============================
    // ROLE SELECTION MODAL
    // ============================
    const signupBtn = document.getElementById("signup-tab");
    const signupRoleModal = document.getElementById("signup-role-modal");
    const roleButtons = document.querySelectorAll(".signup-role-btn");
    const roleCancelBtn = document.getElementById("signup-role-cancel");

    if (signupBtn) {
        signupBtn.addEventListener("click", () => {
            if (signupRoleModal) signupRoleModal.style.display = "flex";
        });
    }

    if (roleCancelBtn) {
        roleCancelBtn.addEventListener("click", () => {
            signupRoleModal.style.display = "none";
        });
    }

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
