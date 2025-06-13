// Auth verification for prestamos.html
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for auth initialization before doing anything
    try {
        await window.waitForAuthInit();
    } catch (error) {
        console.error('Error waiting for auth initialization:', error);
        window.location.href = 'sistema-prestamos.html';
        return;
    }

    // Auth check function
    const checkAuth = async () => {
        const authState = window.auth?.authState;
        if (!authState?.initialized) {
            console.error('Auth state not initialized');
            return false;
        }

        const currentUser = firebase.auth().currentUser;
        
        // Try localStorage first for persistence
        let userData = localStorage.getItem('userData');
        let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        // Fallback to sessionStorage
        if (!isAuthenticated || !userData) {
            userData = sessionStorage.getItem('userData');
            isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        }

        // Check manual login first
        if (isAuthenticated && userData) {
            try {
                const userDataObj = JSON.parse(userData);
                if (userDataObj && userDataObj.matricula) {
                    // Verify user still exists in database
                    const alumnoRef = firebase.database()
                        .ref('alumno')
                        .orderByChild('matricula')
                        .equalTo(userDataObj.matricula);
                    
                    const snapshot = await alumnoRef.once('value');
                    
                    if (snapshot.exists()) {
                        // Manual user is valid, update auth state
                        window.auth.authState = {
                            isAuthenticated: true,
                            user: userDataObj,
                            isAdmin: false,
                            initialized: true,
                            provider: 'manual'
                        };
                        return true;
                    }
                }
            } catch (error) {
                console.error('Error verifying manual user:', error);
            }
        }

        // Check Firebase login if manual login failed
        if (currentUser) {
            try {
                await currentUser.getIdToken(true);
                return true;
            } catch (error) {
                console.error('Error validating token:', error);
            }
        }

        // If we get here, no valid auth exists
        window.auth?.cleanupAuthState?.();

        // Only redirect if we're not already on the login page
        if (!window.location.pathname.endsWith('sistema-prestamos.html')) {
            window.location.href = 'sistema-prestamos.html';
        }
        return false;
    };

    // Verify initial auth
    const isAuthed = await checkAuth();
    if (!isAuthed && !window.location.pathname.endsWith('sistema-prestamos.html')) {
        window.location.href = 'sistema-prestamos.html';
        return;
    }

    // Listen for both Firebase and manual auth state changes
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            await checkAuth();
        }
    });

    window.addEventListener('authStateChanged', async (event) => {
        if (!event.detail.user) {
            await checkAuth();
        }
    });
});
