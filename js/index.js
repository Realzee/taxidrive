/*
 * TaxiDrive Web Application
 * Main JavaScript file for web-based functionality
 */

document.addEventListener("DOMContentLoaded", onPageReady, false);

function onPageReady() {
    console.log("✅ TaxiDrive web app loaded at:", new Date().toLocaleString());
    initApp();
}

function initApp() {
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
    attachSignupHandler("association");
    attachSignupHandler("driver");
    attachSignupHandler("owner");
    attachSignupHandler("passenger");

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
    // ROLE SELECTION MODAL
    // ============================
    const roleButtons = document.querySelectorAll(".role-btn");
    const signupModal = document.getElementById("signup-modal");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    if (roleButtons) {
        roleButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const role = btn.dataset.role;
                console.log(`🟢 Role selected: ${role}`);
                openModal(role);
                showSignupForm(role);
            });
        });
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", () => {
            closeModal();
        });
    }

    if (signupModal) {
        signupModal.addEventListener("click", (e) => {
            if (e.target === signupModal) {
                closeModal();
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
}

// ============================
// SIGNUP HELPERS
// ============================
function attachSignupHandler(role) {
    const form = document.getElementById(`signup-${role}`);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log(`✍️ Signup form submitted for ${role}`);

        const email = document.getElementById(`signup-${role}-email`).value;
        const password = document.getElementById(`signup-${role}-password`).value;
        const name = document.getElementById(`signup-${role}-name`).value;

        try {
            const userCredential = await firebaseService.signUp(email, password, {
                role: role,
                name: name
            });

            console.log(`${role} created:`, userCredential.user.uid);

            showSuccessModal(
                `${capitalize(role)} created successfully`,
                `Login Email: ${email}<br>Password: ${password}`
            );

            form.reset();
        } catch (error) {
            console.error("❌ Signup error:", error);
            showErrorModal("Signup Failed", error.message);
        }
    });
}

function openModal(role) {
    const titles = {
        association: "Association Signup",
        driver: "Driver Signup",
        owner: "Owner Signup",
        passenger: "Passenger Signup"
    };

    document.getElementById("modal-title").innerText = titles[role] || "Signup";
    document.getElementById("modal-message").innerText = "Please fill in your details below.";
    document.getElementById("modal-login-details").innerText = "";
    document.getElementById("signup-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("signup-modal").style.display = "none";
    hideAllSignupForms();
}

function showSuccessModal(message, loginDetails = "") {
    document.getElementById("modal-title").innerText = "Success!";
    document.getElementById("modal-message").innerText = message;
    document.getElementById("modal-login-details").innerHTML = loginDetails;
    document.getElementById("signup-modal").style.display = "flex";
    hideAllSignupForms();
}

function showErrorModal(message, details = "") {
    document.getElementById("modal-title").innerText = "Error!";
    document.getElementById("modal-message").innerText = message;
    document.getElementById("modal-login-details").innerText = details;
    document.getElementById("signup-modal").style.display = "flex";
}

function showSignupForm(role) {
    hideAllSignupForms();
    const form = document.getElementById(`signup-${role}`);
    if (form) {
        form.style.display = "block";
    }
}

function hideAllSignupForms() {
    const forms = document.querySelectorAll(".signup-form");
    forms.forEach(form => {
        form.style.display = "none";
    });
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
