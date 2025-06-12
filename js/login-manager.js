// Script to handle redirection based on fingerprint in sistema-prestamos.html
document.addEventListener('DOMContentLoaded', async () => {
    // Remove artificial wait and show login interface immediately if not authenticated
    const isAdmin = await checkIfAdmin();
    const currentUser = firebase.auth().currentUser;
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    const manualUserData = sessionStorage.getItem('userData');

    if (isAdmin) {
        window.location.href = 'lista-prestamos.html';
    } else if (currentUser || (isAuthenticated && manualUserData)) {
        // Validate existing session
        try {
            if (currentUser) {
                await currentUser.getIdToken(true);
            } else {
                // Verify manual user still exists in database
                const userData = JSON.parse(manualUserData);
                const snapshot = await firebase.database()
                    .ref('alumno')
                    .orderByChild('matricula')
                    .equalTo(userData.matricula)
                    .once('value');

                if (!snapshot.exists()) {
                    throw new Error('Invalid session');
                }
            }

            // Valid session, redirect to prestamos
            window.location.href = 'prestamos.html';
        } catch (error) {
            console.error('Session validation failed:', error);
            // Clean up invalid session
            window.auth?.cleanupAuthState();
            // Show login interface
            document.querySelector('.section').style.display = 'block';
        }
    } else {
        // Show login interface immediately
        document.querySelector('.section').style.display = 'block';
    }

    // Listen for successful login
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                await user.getIdToken(true);
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('userEmail', user.email);
                window.location.href = 'prestamos.html';
            } catch (error) {
                console.error('Token validation failed:', error);
                // Clean up invalid session
                window.auth?.cleanupAuthState();
            }
        }
    });
});
