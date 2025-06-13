// Firebase Auth Initialization Manager

// Global initialization state
let isFirebaseReady = false;
let isAuthReady = false;
let authInitPromise = null;

// Helper function to wait for Firebase availability
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 10;
        const checkInterval = 500;
        
        console.log('Waiting for Firebase initialization...');
        
        if (typeof firebase !== 'undefined' && firebase.app) {
            isFirebaseReady = true;
            console.log('Firebase is already available');
            resolve();
            return;
        }
        
        const checkFirebase = setInterval(() => {
            attempts++;
            if (typeof firebase !== 'undefined' && firebase.app) {
                clearInterval(checkFirebase);
                isFirebaseReady = true;
                console.log('Firebase is available');
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkFirebase);
                const error = new Error('Firebase initialization timeout');
                console.error(error);
                reject(error);
            }
        }, checkInterval);
    });
}

// Helper function to wait for auth completion
function waitForAuth() {
    return new Promise((resolve) => {
        if (isAuthReady) {
            resolve();
            return;
        }

        // Check if user data exists in session storage
        const manualUserData = sessionStorage.getItem('userData');
        if (manualUserData) {
            try {
                const userData = JSON.parse(manualUserData);
                if (userData && userData.isAuthenticated) {
                    isAuthReady = true;
                    resolve();
                    return;
                }
            } catch (e) {
                console.error('Error parsing manual user data:', e);
            }
        }
        
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe();
            isAuthReady = true;
            resolve();
        });
    });
}

// Clean up any stale auth states
function cleanupAuthStates() {
    // Reset auth state on login page
}

// Helper function for retrying operations
async function retryOperation(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed:`, error);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Initialize Firebase Auth with proper sequence
async function initializeAuth() {
    if (authInitPromise) {
        return authInitPromise;
    }

    authInitPromise = (async () => {
        if (!isFirebaseReady) {
            await waitForFirebase();
        }
        
        console.log('Starting Firebase Auth initialization...');
        
        try {
            cleanupAuthStates();
            
            // Configure persistence first
            await retryOperation(() => 
                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            );
            console.log('Auth persistence configured');

            // Initialize the auth state
            if (!window.auth) {
                window.auth = {
                    authState: {
                        isAuthenticated: false,
                        user: null,
                        initialized: false
                    }
                };
            }

            // Esperar SIEMPRE a que Firebase emita el primer onAuthStateChanged
            await new Promise(resolve => {
                let resolved = false;
                const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                    if (resolved) return;
                    resolved = true;
                    unsubscribe();

                    // Buscar login manual válido en ambas storages
                    let manualUserData = null;
                    let isAuthenticated = false;
                    if (localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('userData')) {
                        manualUserData = localStorage.getItem('userData');
                        isAuthenticated = true;
                    } else if (sessionStorage.getItem('isAuthenticated') === 'true' && sessionStorage.getItem('userData')) {
                        manualUserData = sessionStorage.getItem('userData');
                        isAuthenticated = true;
                    }
                    if (manualUserData && isAuthenticated) {
                        try {
                            const userData = JSON.parse(manualUserData);
                            if (userData && userData.matricula) {
                                window.auth.authState = {
                                    isAuthenticated: true,
                                    user: userData,
                                    initialized: true,
                                    provider: 'manual'
                                };
                                // Sincronizar ambas storages SIEMPRE
                                sessionStorage.setItem('isAuthenticated', 'true');
                                sessionStorage.setItem('userData', JSON.stringify(userData));
                                localStorage.setItem('isAuthenticated', 'true');
                                localStorage.setItem('userData', JSON.stringify(userData));
                                resolve();
                                return;
                            }
                        } catch (e) {
                            console.error('Error parsing manual user data:', e);
                        }
                    }

                    // Si no hay login manual, usar el usuario de Firebase
                    window.auth.authState.isAuthenticated = !!user;
                    window.auth.authState.user = user;
                    window.auth.authState.initialized = true;

                    if (user) {
                        sessionStorage.setItem('isAuthenticated', 'true');
                        sessionStorage.setItem('userEmail', user.email);
                        try {
                            const matricula = user.email.split('@')[0];
                            const userRef = firebase.database().ref(`alumno/${matricula}`);
                            const snapshot = await userRef.once('value');
                            if (!snapshot.exists()) {
                                await userRef.set({
                                    matricula: matricula,
                                    nombre: user.displayName,
                                    correo: user.email,
                                    fecha_registro: new Date().toISOString(),
                                    provider: user.providerData[0]?.providerId || 'microsoft.com',
                                    ultimo_acceso: new Date().toISOString()
                                });
                            } else {
                                await userRef.update({
                                    ultimo_acceso: new Date().toISOString()
                                });
                            }
                        } catch (dbError) {
                            console.error('Error updating user data:', dbError);
                        }
                    }
                    resolve();
                });
            });

            // Handle any pending redirect result
            const result = await firebase.auth().getRedirectResult();
            if (result.user) {
                console.log('Redirect sign-in completed');
            }

            console.log('Auth initialization completed');
            isAuthReady = true;
            return window.auth.authState;
        } catch (error) {
            console.error('Auth initialization error:', error);
            cleanupAuthStates();
            throw error;
        }
    })();

    return authInitPromise;
}

// Initialize auth when the DOM is ready and export a way to wait for auth
window.waitForAuthInit = initializeAuth;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const authState = await initializeAuth();
        console.log('Authentication system initialized successfully:', authState);
    } catch (error) {
        console.error('Failed to initialize authentication system:', error);
    }
});
