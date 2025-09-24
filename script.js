// Enhanced JavaScript functionality for TaxiDrive Login System
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing Firebase service...');

        // --- FORM TOGGLE ---
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const loginForm = document.getElementById('login-form');
        const signupAssociationForm = document.getElementById('signup-association');

        loginTab.addEventListener('click', () => {
            loginForm.style.display = 'block';
            signupAssociationForm.style.display = 'none';
            loginTab.style.backgroundColor = 'var(--dark-blue)';
            loginTab.style.color = 'var(--white)';
            signupTab.style.backgroundColor = 'var(--light-blue)';
            signupTab.style.color = 'var(--dark-blue)';
            document.querySelector('h1').textContent = 'Login';
        });

        signupTab.addEventListener('click', () => {
            loginForm.style.display = 'none';
            signupAssociationForm.style.display = 'block';
            signupTab.style.backgroundColor = 'var(--dark-blue)';
            signupTab.style.color = 'var(--white)';
            loginTab.style.backgroundColor = 'var(--light-blue)';
            loginTab.style.color = 'var(--dark-blue)';
            document.querySelector('h1').textContent = 'Sign Up';
        });

        // --- LOGIN FORM ---
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
                const user = await firebaseService.signIn(email, password);
                console.log('Login successful for', user.uid);

                const userSnapshot = await firebase.database().ref(`users/${user.uid}`).once('value');
                const userData = userSnapshot.val();

                localStorage.setItem('userRole', role);
                localStorage.setItem('userId', user.uid);
                localStorage.setItem('userName', userData?.name || email);
                localStorage.setItem('userEmail', email);

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

        // --- ROLE SELECTION MODAL ---
        const signupRoleModal = document.getElementById('signup-role-modal');
        const roleButtons = document.querySelectorAll('.signup-role-btn');
        const roleCancel = document.getElementById('signup-role-cancel');

        if (signupRoleModal) {
            signupTab.addEventListener('click', () => {
                signupRoleModal.style.display = 'flex';
            });

            roleButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const role = btn.dataset.role;
                    console.log('Selected role:', role);
                    signupRoleModal.style.display = 'none';
                    const roleInput = document.getElementById('signup-role');
                    if (roleInput) roleInput.value = role;
                });
            });

            if (roleCancel) {
                roleCancel.addEventListener('click', () => {
                    signupRoleModal.style.display = 'none';
                });
            }

            window.addEventListener('click', (e) => {
                if (e.target === signupRoleModal) {
                    signupRoleModal.style.display = 'none';
                }
            });
        }

        // --- LOGO UPLOAD ---
        const logoInput = document.getElementById('association-logo');
        const logoPreviewContainer = document.getElementById('logo-preview-container');
        const logoPreviewImg = document.getElementById('logo-preview-img');
        const removeLogoBtn = document.getElementById('remove-logo-btn');
        const logoInfo = document.getElementById('logo-info');
        let selectedLogoFile = null;

        if (logoInput) {
            logoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
                if (!validTypes.includes(file.type)) {
                    alert('Please select a valid image file (JPG, PNG, GIF, SVG)');
                    return;
                }

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
            });

            removeLogoBtn.addEventListener('click', () => {
                selectedLogoFile = null;
                logoInput.value = '';
                logoPreviewContainer.style.display = 'none';
                logoPreviewImg.src = '';
                logoInfo.textContent = '';
            });
        }

        // --- SIGNUP FORM ---
        if (signupAssociationForm) {
            signupAssociationForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const associationName = document.getElementById('association-name').value.trim();
                const associationEmail = document.getElementById('association-email').value.trim();
                const associationPhone = document.getElementById('association-phone').value.trim();
                const associationAddress = document.getElementById('association-address').value.trim();

                const adminName = document.getElementById('admin-name').value.trim();
                const adminEmail = document.getElementById('admin-email').value.trim();
                const adminPhone = document.getElementById('admin-phone').value.trim();
                const adminIdNumber = document.getElementById('admin-id-number').value.trim();

                const termsAccepted = document.getElementById('terms-accepted').checked;
                const errorMessage = document.getElementById('signup-error-message');
                const progressContainer = document.getElementById('signup-progress');
                const progressBar = document.getElementById('signup-progress-bar');
                const progressText = document.getElementById('signup-progress-text');

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

                try {
                    progressContainer.style.display = 'block';
                    progressText.textContent = 'Creating association account...';
                    progressBar.style.width = '25%';

                    const associationData = {
                        name: associationName,
                        email: associationEmail,
                        phone: associationPhone,
                        address: associationAddress,
                        adminName,
                        adminEmail,
                        adminPhone,
                        adminIdNumber,
                        termsAccepted,
                        createdAt: new Date().toISOString(),
                        status: 'pending'
                    };

                    // Upload logo
                    if (selectedLogoFile) {
                        const logoRef = firebase.storage().ref().child(`association-logos/${Date.now()}_${selectedLogoFile.name}`);
                        const snapshot = await logoRef.put(selectedLogoFile);
                        associationData.logoUrl = await snapshot.ref.getDownloadURL();
                    }

                    progressText.textContent = 'Saving association data...';
                    progressBar.style.width = '75%';

                    const associationsRef = firebase.database().ref('associations');
                    const newAssociationRef = associationsRef.push();
                    await newAssociationRef.set(associationData);

                    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
                    const adminUser = await firebaseService.signUp(adminEmail, tempPassword, adminName, 'association_admin');

                    await firebase.database().ref(`users/${adminUser.uid}`).update({
                        associationId: newAssociationRef.key,
                        role: 'association_admin'
                    });

                    progressText.textContent = 'Finalizing registration...';
                    progressBar.style.width = '100%';

                    localStorage.setItem('userRole', 'association');
                    localStorage.setItem('userId', adminUser.uid);
                    localStorage.setItem('userName', adminName);
                    localStorage.setItem('userEmail', adminEmail);
                    localStorage.setItem('associationId', newAssociationRef.key);

                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                        alert(`Association registered successfully!\n\nAdmin login credentials:\nEmail: ${adminEmail}\nTemporary Password: ${tempPassword}`);
                        window.location.href = 'Association.html';
                    }, 1000);

                } catch (error) {
                    console.error('Association registration error:', error);
                    progressContainer.style.display = 'none';
                    errorMessage.textContent = error.message || 'Registration failed. Please try again.';
                    errorMessage.style.display = 'block';
                }
            });
        }

    } catch (error) {
        console.error('Initialization error:', error);
        const loginError = document.getElementById('login-error-message');
        if (loginError) {
            loginError.textContent = 'Failed to initialize app. Check console.';
            loginError.style.display = 'block';
        }
    }
});
