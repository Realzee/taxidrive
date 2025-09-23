// Fix for user role authorization issue
// This script ensures the enhancedFirebaseService has the correct user role from database

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Starting user role fix initialization...');

    // Function to update enhancedFirebaseService with fresh user data
    const updateEnhancedFirebaseService = (userData) => {
        if (typeof enhancedFirebaseService !== 'undefined') {
            // Set user role on enhancedFirebaseService instance with fresh database data
            enhancedFirebaseService.currentUser = {
                uid: window.userId,
                email: userData.email || localStorage.getItem('userEmail') || '',
                displayName: userData.name || localStorage.getItem('userName') || ''
            };
            enhancedFirebaseService.userRole = userData.role || 'association';

            console.log('✅ Enhanced Firebase Service updated with fresh database user role:', userData.role);
            console.log('✅ Current user set:', enhancedFirebaseService.currentUser);
            console.log('✅ User role authorization fix completed successfully');
        }
    };

    // Function to check if user data is loaded and update service
    const checkUserDataAndFixRole = () => {
        if (window.userId && typeof enhancedFirebaseService !== 'undefined') {
            // Check if we have fresh user data from database
            const freshUserName = localStorage.getItem('userName');
            const freshUserRole = localStorage.getItem('userRole');
            const freshAssociationName = localStorage.getItem('associationName');

            // Only proceed if we have fresh data (not just initial fallbacks)
            if (freshUserName && freshUserName !== 'Loading...' &&
                freshUserRole && freshUserRole !== 'Association' &&
                freshAssociationName && freshAssociationName !== 'Loading Association...') {

                updateEnhancedFirebaseService({
                    name: freshUserName,
                    role: freshUserRole,
                    associationName: freshAssociationName
                });

                return true;
            }
        }
        return false;
    };

    // Function to wait for loadUserData completion
    const waitForUserDataLoad = () => {
        return new Promise((resolve, reject) => {
            const maxAttempts = 40; // 20 seconds max wait
            let attempts = 0;

            const checkInterval = setInterval(() => {
                attempts++;

                if (checkUserDataAndFixRole()) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('⚠️ Timeout waiting for user data to load from database');
                    // Fallback to localStorage data if available
                    const fallbackRole = localStorage.getItem('userRole') || 'association';
                    updateEnhancedFirebaseService({
                        name: localStorage.getItem('userName') || 'Unknown User',
                        role: fallbackRole,
                        associationName: localStorage.getItem('associationName') || 'Unknown Association'
                    });
                    resolve();
                }
            }, 500);
        });
    };

    // Listen for userDataLoaded event from Association.html
    window.addEventListener('userDataLoaded', (event) => {
        console.log('🎯 Received userDataLoaded event, updating enhancedFirebaseService...');
        const userData = event.detail;
        updateEnhancedFirebaseService({
            name: userData.userName,
            role: userData.userRole,
            associationName: userData.associationName
        });
    });

    // Start the process
    if (window.userId) {
        console.log('🔄 User already authenticated, waiting for database user data...');
        waitForUserDataLoad();
    } else {
        console.log('⏳ Waiting for user authentication...');

        // Wait for authentication first
        const authCheckInterval = setInterval(() => {
            if (window.userId) {
                clearInterval(authCheckInterval);
                console.log('✅ User authenticated, now waiting for database user data...');
                waitForUserDataLoad();
            }
        }, 500);

        // Timeout after 15 seconds for auth
        setTimeout(() => {
            clearInterval(authCheckInterval);
            console.warn('⚠️ Authentication timeout, attempting to fix role with available data');
            if (checkUserDataAndFixRole()) {
                console.log('✅ Role fixed using available data');
            } else {
                console.error('❌ Could not fix user role - insufficient data available');
            }
        }, 15000);
    }
});
