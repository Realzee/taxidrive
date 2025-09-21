// Enhanced JavaScript functionality for TaxiDrive Login System
// This file contains all the JavaScript logic for the login and signup forms

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize Firebase service
        console.log('Initializing Firebase service...');

        // Form toggle functionality
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        // Toggle between login and signup forms
        loginTab.addEventListener('click', () => {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            loginTab.style.backgroundColor = 'var(--dark-blue)';
            loginTab.style.color = 'var(--white)';
            signupTab.style.backgroundColor = 'var(--light-blue)';
            signupTab.style.color = 'var(--dark-blue)';
            document.querySelector('h1').textContent = 'Login';
        });

        signupTab.addEventListener('click', () => {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            signupTab.style.backgroundColor = 'var(--dark-blue)';
            signupTab.style.color = 'var(--white)';
            loginTab.style.backgroundColor = 'var(--light-blue)';
            loginTab.style.color = 'var(--dark-blue)';
            document.querySelector('h1').textContent = 'Sign Up';
        });

        // Login form handler
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const role = document.getElementById('login-role').value;
            const errorMessage = document.getElementById('login-error-message');

            if (!role) {
                errorMessage.textContent = 'Please select a role.';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                // Use Firebase service for authentication
                const user = await firebaseService.signIn(email, password);
                console.log('Login successful for', user.uid, 'at', new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }));

                // Get user data from database to get the name
                const userSnapshot = await firebase.database().ref(`users/${user.uid}`).once('value');
                const userData = userSnapshot.val();

                // Store user data in localStorage
                localStorage.setItem('userRole', role);
                localStorage.setItem('userId', user.uid);
                localStorage.setItem('userName', userData?.name || email);
                localStorage.setItem('userEmail', email);

                // Redirect based on role
                switch (role) {
                    case 'passenger':
                        window.location.href = 'Passenger.html';
                        break;
                    case 'driver':
                        window.location.href = 'Driver.html';
                        break;
                    case 'owner':
                        window.location.href = 'Owner.html';
                        break;
                    case 'association':
                        window.location.href = 'Association.html';
                        break;
                }
            } catch (error) {
                console.error('Login error:', error.message);
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
            }
        });

        // Signup form handler
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const role = document.getElementById('signup-role').value;
            const errorMessage = document.getElementById('signup-error-message');

            // Validation
            if (!name || !email || !password || !role) {
                errorMessage.textContent = 'Please fill in all fields.';
                errorMessage.style.display = 'block';
                return;
            }

            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match.';
                errorMessage.style.display = 'block';
                return;
            }

            if (password.length < 6) {
                errorMessage.textContent = 'Password must be at least 6 characters long.';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                // Use Firebase service for signup
                const user = await firebaseService.signUp(email, password, name, role);
                console.log('Signup successful for', user.uid, 'at', new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }));

                // Store user data in localStorage
                localStorage.setItem('userRole', role);
                localStorage.setItem('userId', user.uid);
                localStorage.setItem('userName', name);
                localStorage.setItem('userEmail', email);

                // Show success message
                alert('Account created successfully! Redirecting to your dashboard...');

                // Redirect based on role
                switch (role) {
                    case 'passenger':
                        window.location.href = 'Passenger.html';
                        break;
                    case 'driver':
                        window.location.href = 'Driver.html';
                        break;
                    case 'owner':
                        window.location.href = 'Owner.html';
                        break;
                    case 'association':
                        window.location.href = 'Association.html';
                        break;
                }
            } catch (error) {
                console.error('Signup error:', error.message);
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
            }
        });

    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('login-error-message').textContent = 'Failed to initialize app. Check console.';
        document.getElementById('login-error-message').style.display = 'block';
    }
});
