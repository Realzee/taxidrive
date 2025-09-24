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

        // Logo upload functionality
        const logoInput = document.getElementById('association-logo');
        const logoPreviewContainer = document.getElementById('logo-preview-container');
        const logoPreviewImg = document.getElementById('logo-preview-img');
        const removeLogoBtn = document.getElementById('remove-logo-btn');
        const logoInfo = document.getElementById('logo-info');
        let selectedLogoFile = null;

        function showSignupModal(title, message, loginDetails = '') {
    const modal = document.getElementById('signup-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalLogin = document.getElementById('modal-login-details');
    const closeBtn = document.getElementById('modal-close-btn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalLogin.textContent = loginDetails;
    modal.style.display = 'flex';

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
}


        // Logo upload handler
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
                if (!validTypes.includes(file.type)) {
                    alert('Please select a valid image file (JPG, PNG, GIF, SVG)');
                    return;
                }

                // Validate file size (2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('File size must be less than 2MB');
                    return;
                }

                selectedLogoFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    logoPreviewImg.src = e.target.result;
                    logoPreviewImg.alt = file.name;
                    logoPreviewContainer.style.display = 'block';
                    logoInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Remove logo handler
        removeLogoBtn.addEventListener('click', () => {
            selectedLogoFile = null;
            logoInput.value = '';
            logoPreviewContainer.style.display = 'none';
            logoPreviewImg.src = '';
            logoInfo.textContent = '';
        });

        // Signup form handler
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

        document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const associationName = document.getElementById('association-name').value;
    const associationEmail = document.getElementById('association-email').value;
    const adminName = document.getElementById('admin-name').value;
    const adminEmail = document.getElementById('admin-email').value;
    const adminPassword = Math.random().toString(36).slice(-8); // Generate temp password

    try {
        // Sign up admin user
        const user = await firebaseService.signUp(adminEmail, adminPassword, adminName, 'association');

        // Store association details in DB
        await firebaseService.database.ref(`associations/${user.uid}`).set({
            name: associationName,
            email: associationEmail,
            adminUid: user.uid,
            createdAt: new Date().toISOString()
        });

        // Show confirmation modal with login credentials
        showSignupModal(
            'Association Created!',
            `The association "${associationName}" has been registered successfully.`,
            `Admin Email: ${adminEmail}\nPassword: ${adminPassword}`
        );

        // Reset the form
        document.getElementById('signup-form').reset();

    } catch (error) {
        console.error('Signup error:', error);
        showSignupModal(
            'Error',
            'Failed to create association. Please try again.',
            error.message
        );
    }
});
    

            // Get form data
            const associationName = document.getElementById('association-name').value.trim();
            const associationEmail = document.getElementById('association-email').value.trim();
            const associationPhone = document.getElementById('association-phone').value.trim();
            const associationRegistrationNumber = document.getElementById('association-registration-number').value.trim();
            const associationAddress = document.getElementById('association-address').value.trim();
            const associationDescription = document.getElementById('association-description').value.trim();

            const adminName = document.getElementById('admin-name').value.trim();
            const adminEmail = document.getElementById('admin-email').value.trim();
            const adminPhone = document.getElementById('admin-phone').value.trim();
            const adminIdNumber = document.getElementById('admin-id-number').value.trim();

            const termsAccepted = document.getElementById('terms-accepted').checked;

            const errorMessage = document.getElementById('signup-error-message');
            const progressContainer = document.getElementById('signup-progress');
            const progressBar = document.getElementById('signup-progress-bar');
            const progressText = document.getElementById('signup-progress-text');

            // Validation
            if (!associationName || !associationEmail || !associationPhone || !associationAddress ||
                !adminName || !adminEmail || !adminPhone || !adminIdNumber) {
                errorMessage.textContent = 'Please fill in all required fields.';
                errorMessage.style.display = 'block';
                return;
            }

            if (!termsAccepted) {
                errorMessage.textContent = 'Please accept the terms and conditions.';
                errorMessage.style.display = 'block';
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(associationEmail) || !emailRegex.test(adminEmail)) {
                errorMessage.textContent = 'Please enter valid email addresses.';
                errorMessage.style.display = 'block';
                return;
            }

            // Phone validation (basic)
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(associationPhone) || !phoneRegex.test(adminPhone)) {
                errorMessage.textContent = 'Please enter valid phone numbers.';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                // Show progress
                progressContainer.style.display = 'block';
                progressText.textContent = 'Creating association account...';
                progressBar.style.width = '25%';

                // Create association data object
                const associationData = {
                    name: associationName,
                    email: associationEmail,
                    phone: associationPhone,
                    registrationNumber: associationRegistrationNumber,
                    address: associationAddress,
                    description: associationDescription,
                    adminName: adminName,
                    adminEmail: adminEmail,
                    adminPhone: adminPhone,
                    adminIdNumber: adminIdNumber,
                    termsAccepted: termsAccepted,
                    createdAt: new Date().toISOString(),
                    status: 'pending', // Will be approved by admin
                    memberCount: 0
                };

                progressText.textContent = 'Uploading logo...';
                progressBar.style.width = '50%';

                // Upload logo if provided
                if (selectedLogoFile) {
                    const logoRef = firebase.storage().ref().child(`association-logos/${Date.now()}_${selectedLogoFile.name}`);
                    const snapshot = await logoRef.put(selectedLogoFile);
                    associationData.logoUrl = await snapshot.ref.getDownloadURL();
                }

                progressText.textContent = 'Saving association data...';
                progressBar.style.width = '75%';

                // Save to Firebase
                const associationsRef = firebase.database().ref('associations');
                const newAssociationRef = associationsRef.push();
                await newAssociationRef.set(associationData);

                // Create admin user account
                const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
                const adminUser = await firebaseService.signUp(adminEmail, tempPassword, adminName, 'association_admin');

                // Link admin to association
                await firebase.database().ref(`users/${adminUser.uid}`).update({
                    associationId: newAssociationRef.key,
                    role: 'association_admin',
                    adminLevel: 'primary'
                });

                progressText.textContent = 'Finalizing registration...';
                progressBar.style.width = '100%';

                console.log('Association registration successful for', newAssociationRef.key, 'at', new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }));

                // Store user data in localStorage
                localStorage.setItem('userRole', 'association');
                localStorage.setItem('userId', adminUser.uid);
                localStorage.setItem('userName', adminName);
                localStorage.setItem('userEmail', adminEmail);
                localStorage.setItem('associationId', newAssociationRef.key);

                // Hide progress and show success
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    alert(`Association registered successfully!\n\nAdministrator login credentials:\nEmail: ${adminEmail}\nTemporary Password: ${tempPassword}\n\nPlease change your password after first login.\n\nRedirecting to dashboard...`);

                    // Redirect to association dashboard
                    window.location.href = 'Association.html';
                }, 1000);

            } catch (error) {
                console.error('Association registration error:', error);
                progressContainer.style.display = 'none';
                errorMessage.textContent = error.message || 'Registration failed. Please try again.';
                errorMessage.style.display = 'block';
            }
        });

    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('login-error-message').textContent = 'Failed to initialize app. Check console.';
        document.getElementById('login-error-message').style.display = 'block';
    }
});
