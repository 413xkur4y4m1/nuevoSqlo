// Verificación de autenticación específica para prestamos.html
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Starting auth verification...');
    
    // Ensure Firebase is initialized
    if (!firebase.apps.length) {
        console.error('Firebase not initialized');
        window.location.href = 'sistema-prestamos.html';
        return;
    }

    // Wait for auth.js initialization
    await new Promise(resolve => {
        if (window.auth) {
            resolve();
        } else {
            const checkAuth = setInterval(() => {
                if (window.auth) {
                    clearInterval(checkAuth);
                    resolve();
                }
            }, 100);
        }
    });

    // Hide content initially with opacity for smooth transition
    document.body.style.opacity = '0';

    try {
        // Try localStorage first for persistence
        let userData = localStorage.getItem('userData');
        let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        // Fallback to sessionStorage
        if (!isAuthenticated || !userData) {
            userData = sessionStorage.getItem('userData');
            isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        }

        // Parse user data if it exists
        let manualUserData = null;
        if (userData) {
            try {
                manualUserData = JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        // Wait for Firebase auth state
        const user = await new Promise((resolve) => {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });

        // If neither Firebase nor manual auth is valid, redirect
        if (!user && !manualUserData) {
            throw new Error('No valid authentication found');
        }

        // Verify user in database
        const matricula = user ? user.email.split('@')[0] : manualUserData.matricula;
        const alumnoRef = firebase.database().ref('alumno/' + matricula);
        const snapshot = await alumnoRef.once('value');

        if (!snapshot.exists()) {
            throw new Error('User not found in database');
        }

        // Update last access
        await alumnoRef.update({
            ultimo_acceso: new Date().toISOString()
        });

        // Update window.auth state
        window.auth.authState = {
            isAuthenticated: true,
            user: user || manualUserData,
            isAdmin: false,
            initialized: true,
            provider: user ? 'microsoft.com' : 'manual'
        };

        // Show content with transition
        document.body.style.opacity = '1';
        
        // Keep session verification active
        firebase.auth().onAuthStateChanged((user) => {
            let isManual = false;
            if (!user && isAuthenticated && window.auth && window.auth.authState && window.auth.authState.user) {
                isManual = true;
            }
            
            if (!user && !isManual) {
                // Clean up auth states if no valid session exists
                if (window.auth && window.auth.cleanupAuthState) {
                    window.auth.cleanupAuthState();
                }
                // Redirect to login
                window.location.href = 'sistema-prestamos.html';
            } else {
                // Update UI with current user
                window.auth.authState.user = user || window.auth.authState.user;
                window.auth.authState.isAuthenticated = true;
                if (typeof updateUI === 'function') {
                    updateUI(user || window.auth.authState.user);
                }
            }
        });

    } catch (error) {
        console.error('Auth verification error:', error);
        // Clean up auth states
        if (window.auth && window.auth.cleanupAuthState) {
            window.auth.cleanupAuthState();
        }
        window.location.href = 'sistema-prestamos.html';
    }
});
