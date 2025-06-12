// UI initialization
let isInitialized = false;

// Función para cargar materiales desde Firebase
async function cargarMateriales() {
    const selectMaterial = document.getElementById('objeto');
    if (!selectMaterial) return;
    
    selectMaterial.innerHTML = '<option value="">Selecciona un material</option>';

    try {
        mostrarEstado('Cargando materiales...', 'loading');
        
        // Cargar materiales solo de la rama 'materiales'
        const materialesSnapshot = await firebase.database().ref('materiales').once('value');
        const materiales = materialesSnapshot.val();
        
        let materialesEncontrados = false;

        if (materiales) {
            Object.entries(materiales).forEach(([id, material]) => {
                if (material.cantidad > 0) {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = `${material.nombre} (${material.cantidad} disponibles)`;
                    selectMaterial.appendChild(option);
                    materialesEncontrados = true;
                }
            });
        }

        if (materialesEncontrados) {
            mostrarEstado('Materiales cargados exitosamente', 'success');
        } else {
            selectMaterial.innerHTML += '<option disabled>No hay materiales disponibles</option>';
            mostrarEstado('No hay materiales disponibles', 'warning');
        }
    } catch (error) {
        console.error('Error al cargar materiales:', error);
        selectMaterial.innerHTML += '<option disabled>Error al cargar materiales</option>';
        mostrarEstado('Error al cargar materiales: ' + error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing prestamos.js...');
    // Ensure body is initially hidden
    document.body.style.opacity = '0';
    
    // Set up auth state listener
    firebase.auth().onAuthStateChanged(async user => {
        console.log('Auth state changed:', user ? 'user logged in' : 'no user');
        
        // Asegurarse de que window.auth esté inicializado
        if (!window.auth) {
            window.auth = { authState: {} };
        }
        
        window.auth.authState.user = user;
        console.log('Updated window.auth.authState.user:', window.auth.authState.user); // Punto de depuración
        
        if (!isInitialized) {
            isInitialized = true;
            console.log('First time initialization');
        }

        updateUI(user);
        
        if (user || (sessionStorage.getItem('isAuthenticated') === 'true' && sessionStorage.getItem('userData'))) {
            try {
                await cargarMateriales();
                console.log('Materials loaded successfully');
                document.body.classList.add('loaded');
            } catch (error) {
                console.error('Error loading materials:', error);
                mostrarEstado('Error al cargar materiales: ' + error.message, 'error');
                document.body.classList.add('loaded');
            }
        } else {
            document.body.classList.add('loaded');
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Registrar el manejador de eventos para el formulario de préstamo
    const formPrestamo = document.getElementById('formPrestamo');
    if (formPrestamo) {
        formPrestamo.addEventListener('submit', (event) => {
            event.preventDefault();
            solicitarPrestamo();
        });
    }
});

// Update UI elements based on auth state
function updateUI(user) {
    // Try localStorage first for persistence
    let userData = localStorage.getItem('userData');
    let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    // Fallback to sessionStorage
    if (!isAuthenticated || !userData) {
        userData = sessionStorage.getItem('userData');
        isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    }

    // Only parse userData if it exists
    let manualUserData = null;
    if (userData) {
        try {
            manualUserData = JSON.parse(userData);
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }

    // Check if authenticated either through Firebase or manual login
    isAuthenticated = user || (isAuthenticated && manualUserData);

    if (isAuthenticated) {
        let displayName, email;
        if (user) {
            displayName = user.displayName || user.email;
            email = user.email;
        } else if (manualUserData) {
            displayName = `${manualUserData.nombre || ''} ${manualUserData.apellido_p || ''} ${manualUserData.apellido_m || ''}`.trim();
            displayName = displayName || manualUserData.email;
            email = manualUserData.email;
        }

        document.getElementById('login')?.style.setProperty('display', 'none');
        document.getElementById('userInfo')?.style.setProperty('display', 'block');
        document.querySelector('.form-content')?.style.setProperty('display', 'block');
        document.getElementById('qrContainer')?.style.setProperty('display', 'none');
        
        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        
        if (userNameElement) userNameElement.textContent = displayName;
        if (userEmailElement) userEmailElement.textContent = email;
    } else {
        document.getElementById('login')?.style.setProperty('display', 'block');
        document.getElementById('userInfo')?.style.setProperty('display', 'none');
        document.querySelector('.form-content')?.style.setProperty('display', 'none');
        document.getElementById('qrContainer')?.style.setProperty('display', 'none');
    }
}

// Función para mostrar mensajes de estado
function mostrarEstado(mensaje, tipo) {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;

    statusDiv.textContent = mensaje;
    statusDiv.className = 'status ' + tipo;
    statusDiv.style.display = 'block';

    if (tipo !== 'loading') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Función para solicitar préstamo
async function solicitarPrestamo() {
    const currentUser = window.auth?.authState?.user;
    console.log('Current user in solicitarPrestamo:', currentUser); // Punto de depuración
    
    if (!currentUser) {
        mostrarEstado('Por favor inicia sesión primero', 'error');
        return;
    }

    const id_material = document.getElementById('objeto').value;
    const materia = document.getElementById('materia').value;
    const fecha_limite = document.getElementById('fecha_limite').value;

    if (!id_material || !materia || !fecha_limite) {
        mostrarEstado('Por favor completa todos los campos', 'error');
        return;
    }

    // Validar que la fecha límite no sea anterior a hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaLimite = new Date(fecha_limite);
    if (fechaLimite < hoy) {
        mostrarEstado('La fecha límite no puede ser anterior a hoy', 'error');
        return;
    }

    try {
        mostrarEstado('Procesando solicitud...', 'loading');

        // Obtener datos del alumno
        const alumnoSnapshot = await firebase.database()
            .ref('alumno')
            .orderByChild('correo')
            .equalTo(currentUser.email)
            .once('value');

        const alumnoData = alumnoSnapshot.val();
        if (!alumnoData) {
            mostrarEstado('No se encontró registro de estudiante con este correo', 'error');
            return;
        }

        const alumno = Object.values(alumnoData)[0];

        // Verificar disponibilidad del material
        const materialRef = firebase.database().ref(`materiales/${sanitizeKey(id_material)}`);
        const materialSnapshot = await materialRef.once('value');
        const material = materialSnapshot.val();

        if (!material || material.cantidad <= 0) {
            mostrarEstado('Este material no está disponible actualmente', 'error');
            return;
        }

        // Verificar si el alumno ya tiene 3 préstamos activos del mismo material
        const prestamosActivosSnapshot = await firebase.database()
            .ref('prestamos')
            .orderByChild('matricula_alumno')
            .equalTo(alumno.matricula)
            .once('value');
        
        const prestamosActivos = prestamosActivosSnapshot.val() || {};
        const prestamosDelMismoMaterial = Object.values(prestamosActivos)
            .filter(prestamo => prestamo.id_material === id_material && prestamo.estado === 'activo');
            
        if (prestamosDelMismoMaterial.length >= 3) {
            mostrarEstado('Ya tienes el máximo de 3 préstamos activos para este material', 'error');
            return;
        }

        // Crear préstamo
        const prestamosRef = firebase.database().ref('prestamos');
        const nuevoPrestamo = prestamosRef.push();
        
        // Obtener el precio_unitario actualizado del material
        const precio_unitario = material.precio_unitario !== undefined ? material.precio_unitario : 0;
        
        const prestamoData = {
            id_prestamo: nuevoPrestamo.key,
            matricula_alumno: alumno.matricula,
            nombre_alumno: `${alumno.nombre} ${alumno.apellido_p} ${alumno.apellido_m}`.trim(),
            id_material: id_material,
            nombre_material: material.nombre,
            precio_unitario: precio_unitario,
            materia: materia,
            fecha_prestamo: new Date().toISOString().split('T')[0],
            fecha_limite: fecha_limite,
            estado: 'activo'
        };

        // Actualizar cantidad de material
        await materialRef.update({
            cantidad: material.cantidad - 1
        });

        // Guardar préstamo
        await nuevoPrestamo.set(prestamoData);

        // Actualizar lista de materiales
        await cargarMateriales();

        // Mostrar código QR con solo la información esencial
        const qrData = {
            id: prestamoData.id_prestamo,
            mat: prestamoData.matricula_alumno,
            mat_id: prestamoData.id_material,
            fecha: prestamoData.fecha_limite
        };
        
        document.getElementById('qrContainer').style.display = 'block';
        document.getElementById('codigo-qr').innerHTML = '';
        new QRCode(document.getElementById('codigo-qr'), {
            text: JSON.stringify(qrData),
            width: 128,
            height: 128,
            correctLevel: QRCode.CorrectLevel.L
        });

        document.getElementById('mensajeQR').textContent = 
            `Préstamo registrado exitosamente. ID: ${prestamoData.id_prestamo}`;

        // Limpiar formulario
        document.getElementById('formPrestamo').reset();
        mostrarEstado('Préstamo registrado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        mostrarEstado('Error al registrar el préstamo: ' + error.message, 'error');
    }
}

// Cerrar sesión
function logout() {
    // Limpiar estados de autenticación
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');

    // Cerrar sesión en Firebase si hay usuario
    if (firebase.auth().currentUser) {
        firebase.auth().signOut().then(() => {
            window.location.href = 'sistema-prestamos.html';
        }).catch((error) => {
            console.error('Error al cerrar sesión:', error);
            mostrarEstado('Error al cerrar sesión', 'error');
            window.location.href = 'sistema-prestamos.html';
        });
    } else {
        window.location.href = 'sistema-prestamos.html';
    }
}

// Function to sanitize material names for Firebase paths
function sanitizeKey(name) {
    return name
        .toLowerCase()
        .replace(/[\.\#\$\[\]]/g, '') // Remove invalid characters
        .trim();
}