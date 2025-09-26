javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

// Initialize Supabase client
const SUPABASE_URL = 'https://kgyiwowwdwxrxsuydwii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtneWl3b3d3ZHd4cnhzdXlkd2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODUyMzUsImV4cCI6MjA3NDQ2MTIzNX0.CYWfAs4xaBf7WwJthiBGHw4iBtiY1wwYvghHcXQnVEc';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        console.error(`Error element ${elementId} not found`);
    }
}

// Helper: Show success modal
function showSuccess(message, loginDetails = '') {
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalLoginDetails = document.getElementById('modal-login-details');
    const signupModal = document.getElementById('signup-modal');
    
    if (modalTitle && modalMessage && modalLoginDetails && signupModal) {
        modalTitle.textContent = 'Success!';
        modalMessage.textContent = message;
        modalLoginDetails.textContent = loginDetails;
        signupModal.style.display = 'flex';
    } else {
        console.error('Success modal elements not found');
    }
}

// Authentication: Login
async function login(email, password, role) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showError('login-error-message', error.message || 'Login failed');
            return null;
        }

        // Verify role
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('email', email)
            .single();

        if (userError || userData?.role !== role) {
            showError('login-error-message', userError?.message || 'Invalid role or user not found');
            await supabase.auth.signOut();
            return null;
        }

        console.log('Logged in as:', role);
        return data.user;
    } catch (err) {
        showError('login-error-message', err.message || 'An unexpected error occurred during login');
        console.error('Login error:', err);
        return null;
    }
}

// Signup: Generic for simple roles (passenger, driver, owner)
async function signupSimple(role, formData) {
    const { email, password, license_number, company_name } = formData;
    const errorElementId = `signup-${role}-error-message`;

    try {
        // Validate password length
        if (password.length < 8) {
            showError(errorElementId, 'Password must be at least 8 characters long');
            return null;
        }

        // Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) {
            showError(errorElementId, authError.message || 'Registration failed');
            return null;
        }

        // Insert user data
        const userData = {
            id: authData.user.id,
            email,
            role
        };
        if (license_number) userData.license_number = license_number;
        if (company_name) userData.company_name = company_name;

        const { error: dbError } = await supabase.from('users').insert(userData);
        if (dbError) {
            showError(errorElementId, dbError.message || 'Failed to save user data');
            return null;
        }

        showSuccess(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`, `Login with: ${email}`);
        console.log(`${role} registered successfully`);
        return authData.user;
    } catch (err) {
        showError(errorElementId, err.message || 'An unexpected error occurred during registration');
        console.error(`${role} signup error:`, err);
        return null;
    }
}

// Signup: For Association (complex, with logo upload)
async function signupAssociation(formData) {
    const {
        name, email, phone, registrationNumber, address, description,
        logo: logoFile, adminEmail, adminPassword, adminName, adminPhone, adminIdNumber
    } = formData;
    const errorElementId = 'signup-association-error-message';

    try {
        // Validate password length
        if (adminPassword.length < 8) {
            showError(errorElementId, 'Administrator password must be at least 8 characters long');
            return null;
        }

        // Sign up admin
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword
        });
        if (authError) {
            showError(errorElementId, authError.message || 'Admin registration failed');
            return null;
        }

        const adminId = authData.user.id;

        // Insert admin as user
        const { error: userError } = await supabase.from('users').insert({
            id: adminId,
            email: adminEmail,
            role: 'association'
        });
        if (userError) {
            showError(errorElementId, userError.message || 'Failed to save admin user data');
            return null;
        }

        // Upload logo if provided
        let logoUrl = null;
        if (logoFile) {
            const fileName = `${adminId}/${Date.now()}_${logoFile.name}`; // Unique file name
            const { data: storageData, error: storageError } = await supabase.storage
                .from('logos')
                .upload(fileName, logoFile, { cacheControl: '3600', upsert: false });
            if (storageError) {
                showError(errorElementId, storageError.message || 'Failed to upload logo');
                return null;
            }
            const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
            logoUrl = publicUrlData.publicUrl;
        }

        // Insert association data
        const associationData = {
            name,
            email,
            phone,
            address,
            admin_id: adminId,
            admin_name: adminName,
            admin_phone: adminPhone,
            admin_id_number: adminIdNumber
        };
        if (registrationNumber) associationData.registration_number = registrationNumber;
        if (description) associationData.description = description;
        if (logoUrl) associationData.logo_url = logoUrl;

        const { error: assocError } = await supabase.from('associations').insert(associationData);
        if (assocError) {
            showError(errorElementId, assocError.message || 'Failed to save association data');
            return null;
        }

        showSuccess('Association created successfully', `Admin Email: ${adminEmail}`);
        console.log('Association registered successfully');
        return authData.user;
    } catch (err) {
        showError(errorElementId, err.message || 'An unexpected error occurred during association registration');
        console.error('Association signup error:', err);
        return null;
    }
}

// Export functions for use in other scripts
export { login, signupSimple, signupAssociation };