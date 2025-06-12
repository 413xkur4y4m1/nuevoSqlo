// Script para proteger páginas de administración
document.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = await checkIfAdmin();
    
    if (!isAdmin) {
        // Si no es admin, redirigir al login
        window.location.href = 'sistema-prestamos.html';
        return;
    }
    
    // Si es admin, mostrar la interfaz
    document.body.style.visibility = 'visible';
});
