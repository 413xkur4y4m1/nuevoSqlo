// Lista de visitor IDs de administradores
const adminVisitorIds = [
    'bc05714a6d6450c967d28e560d62aeaa',
    '3b15980450b2a58e7e406529933b29a6',
    
    // Para agregar más IDs, agrégalos así:
    // 'otro-id-aqui',
    // 'otro-id-mas'
];

// Inicializar FingerprintJS
async function initFingerprint() {
    try {
        // Initialize the agent
        const fpPromise = FingerprintJS.load();
        
        // Get the visitor identifier
        const fp = await fpPromise;
        const result = await fp.get();
        const visitorId = result.visitorId;
        
        // Guardar el ID en localStorage para referencia
        localStorage.setItem('visitorId', visitorId);
        
        // Para desarrollo: mostrar el ID en consola para poder agregarlo a la lista de admins
        console.log('Tu Visitor ID es:', visitorId);
        
        return visitorId;
    } catch (error) {
        console.error('Error al obtener fingerprint:', error);
        return null;
    }
}

// Verificar si el usuario actual es admin
async function checkIfAdmin() {
    const visitorId = localStorage.getItem('visitorId') || await initFingerprint();
    const isAdmin = adminVisitorIds.includes(visitorId);
    localStorage.setItem('isAdmin', isAdmin);
    return isAdmin;
}

// Redirigir basado en el rol y la acción
async function handleAdminNavigation(action) {
    const isAdmin = await checkIfAdmin();
    
    if (isAdmin) {
        switch(action.toLowerCase()) {
            case 'prestamos':
                window.location.href = 'lista-prestamos.html';
                break;
            case 'adeudos':
            case 'generar':
                window.location.href = 'adeudo.html';
                break;
            default:
                // No hacer nada si la acción no es reconocida
                break;
        }
    } else {
        // Si no es admin, redirigir al login
        window.location.href = 'sistema-prestamos.html';
    }
}

// Función para mostrar/ocultar elementos según el rol
async function updateUIByRole() {
    const isAdmin = await checkIfAdmin();
    const adminElements = document.querySelectorAll('.admin-only');
    
    adminElements.forEach(element => {
        element.style.display = isAdmin ? 'block' : 'none';
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initFingerprint().then(() => {
        updateUIByRole();
    });
});
