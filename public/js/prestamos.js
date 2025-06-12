// Firebase Auth and Database integration
let currentUser = null;

// Llenar el select de materiales
const materia11Ref = firebase.database().ref('materia11');
materia11Ref.once('value').then(snapshot => {
  const material = snapshot.val();
  if (material) {
    let o = document.createElement('option');
    o.value = 'materia11';
    o.textContent = material.nombre;
    document.getElementById('objeto').appendChild(o);
  }
});

// Firebase Auth setup
document.getElementById('btnLogin').addEventListener('click', () => {
  const provider = new firebase.auth.OAuthProvider('microsoft.com');
  provider.setCustomParameters({
    tenant: 'common',
    prompt: 'select_account'
  });

  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      currentUser = result.user;
      document.getElementById('login').style.display = 'none';
      document.getElementById('userInfo').style.display = 'block';
      document.getElementById('formPrestamo').style.display = 'block';
      document.getElementById('userName').textContent = currentUser.displayName;
      document.getElementById('userEmail').textContent = currentUser.email;
    })
    .catch((error) => {
      console.error('Error de autenticación:', error);
      alert('Error al iniciar sesión: ' + error.message);
    });
});

function logout() {
  firebase.auth().signOut().then(() => {
    currentUser = null;
    document.getElementById('login').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('formPrestamo').style.display = 'none';
    document.getElementById('qrContainer').style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});

document.getElementById('formPrestamo').addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if (!currentUser) {
    alert('Por favor inicia sesión primero');
    return;
  }

  const id_material = document.getElementById('objeto').value;
  const fecha_limite = document.getElementById('fecha_limite').value;
  const materia = document.getElementById('materia').value;

  try {
    // Get student data from correo
    const alumnosRef = firebase.database().ref('alumno');
    const alumnoSnapshot = await alumnosRef
      .orderByChild('correo')
      .equalTo(currentUser.email)
      .once('value');
    
    const alumnoData = alumnoSnapshot.val();
    if (!alumnoData) {
      alert('No se encontró registro de estudiante con este correo');
      return;
    }

    const alumno = Object.values(alumnoData)[0];

    // Create new loan in Firebase
    const prestamosRef = firebase.database().ref('prestamos');
    const newPrestamoRef = prestamosRef.push();    const prestamoData = {
      id_prestamo: newPrestamoRef.key,
      matricula_alumno: alumno.matricula,
      id_material: 'materia11',
      fecha_prestamo: new Date().toISOString(),
      fecha_limite: fecha_limite,
      materia: materia,
      estado: 'activo'
    };

    await newPrestamoRef.set(prestamoData);

    // Generate QR code
    document.getElementById('qrContainer').style.display = 'block';
    document.getElementById('codigo-qr').innerHTML = ''; // Clear previous QR
    new QRCode(document.getElementById('codigo-qr'), {
      text: prestamoData.id_prestamo,
      width: 150,
      height: 150
    });
    document.getElementById('mensajeQR').textContent = '¡Préstamo registrado exitosamente!';
  } catch (error) {
    console.error('Error:', error);
    alert('Error al registrar el préstamo: ' + error.message);
  }
});
