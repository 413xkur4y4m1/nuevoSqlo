// Firebase Auth and Database integration
let currentUser = null;

// Auth state observer
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        document.getElementById('login').style.display = 'none';
        document.getElementById('userInfo').style.display = 'block';
        document.getElementById('formPrestamo').style.display = 'block';
        document.getElementById('userName').textContent = user.displayName || user.email;
        document.getElementById('userEmail').textContent = user.email;
        cargarMateriales();
    } else {
        window.location.href = 'sistema-prestamos.html';
    }
});

// Cargar materiales disponibles
async function cargarMateriales() {
    try {
        const snapshot = await firebase.database().ref('materiales').once('value');
        const materiales = snapshot.val();

        if (materiales) {
            // Mostrar materiales disponibles
            Object.entries(materiales).forEach(([id, material]) => {
                if (material.cantidad > 0) {
                    let o = document.createElement('option');
                    o.value = id;
                    o.textContent = `${material.nombre} (${material.cantidad} disponibles)`;
                    document.getElementById('objeto').appendChild(o);
                }
            });
        } else {
            console.warn('No hay materiales disponibles en la base de datos');
        }
    } catch (error) {
        console.error('Error al cargar materiales:', error);
        alert('Error al cargar materiales: ' + error.message);
    }
}

// Handle form submission
document.getElementById('formPrestamo').addEventListener('submit', async (evt) => {
    evt.preventDefault();
    if (!currentUser) {
        alert('Por favor inicia sesión primero');
        return;
    }

    try {
        // Get form data
        const id_material = document.getElementById('objeto').value;
        const fecha_limite = document.getElementById('fecha_limite').value;
        const materia = document.getElementById('materia').value;

        // Get student data
        const alumnoSnapshot = await firebase.database()
            .ref('alumno')
            .orderByChild('correo')
            .equalTo(currentUser.email)
            .once('value');

        const alumnoData = alumnoSnapshot.val();
        if (!alumnoData) {
            alert('No se encontró registro de estudiante con este correo');
            return;
        }

        const alumno = Object.values(alumnoData)[0];
        
        // Verificar disponibilidad del material antes de crear el préstamo
        const materialSnapshot = await firebase.database().ref(`materiales/${id_material}`).once('value');
        const material = materialSnapshot.val();
        
        if (!material || material.cantidad <= 0) {
            alert('Este material no está disponible actualmente');
            return;
        }
        
        // Actualizar cantidad de material
        await firebase.database().ref(`materiales/${id_material}`).update({
            cantidad: material.cantidad - 1
        });
        
        // Create loan
        const prestamoRef = firebase.database().ref('prestamos').push();
        const prestamo = {
            id_prestamo: prestamoRef.key,
            matricula_alumno: alumno.matricula,
            id_material: id_material,
            materia: materia,
            fecha_prestamo: new Date().toISOString().split('T')[0],
            fecha_limite: fecha_limite,
            estado: 'activo'
        };

        await prestamoRef.set(prestamo);

        // Generate QR
        document.getElementById('codigo-qr').innerHTML = '';
        new QRCode(document.getElementById('codigo-qr'), {
            text: JSON.stringify(prestamo),
            width: 128,
            height: 128
        });

        document.getElementById('qrContainer').style.display = 'block';
        document.getElementById('mensajeQR').textContent = 
            `Préstamo registrado exitosamente. ID: ${prestamoRef.key}`;
        
        evt.target.reset();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar el préstamo: ' + error.message);
    }
});

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'sistema-prestamos.html';
    });
}