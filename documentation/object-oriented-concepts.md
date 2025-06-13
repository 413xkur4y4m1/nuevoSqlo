# Conceptos de Programación Orientada a Objetos en el Sistema de Gestión de Biblioteca

## 1. Abstracciones

### Abstracción de Usuario
El sistema abstrae los usuarios en dos tipos principales:
- Estudiantes (Alumnos)
- Administradores

Atributos principales abstraídos:
- Información personal (nombre, apellidos, correo)
- Estado de autenticación
- Permisos basados en roles

### Abstracción de Material
Los materiales de la biblioteca se abstraen con:
- ID
- Nombre
- Cantidad
- Precio unitario
- Proveedor
- Tipo

### Abstracción de Préstamo
El proceso de préstamo se abstrae con:
- ID de préstamo
- ID de estudiante
- ID de material
- Fecha de préstamo
- Fecha límite
- Estado

## 2. Clases

### Clase Alumno (Implícita en la estructura de Firebase)
```javascript
class Alumno {
    matricula: number      // Número de matrícula del estudiante
    nombre: string         // Nombre del estudiante
    apellido_p: string     // Apellido paterno
    apellido_m: string     // Apellido materno
    carrera: string        // Carrera que estudia
    email: string          // Correo electrónico
    fecha_registro: Date   // Fecha de registro en el sistema
}
```

### Clase Préstamo (Implícita en la estructura de Firebase)
```javascript
class Prestamo {
    id_prestamo: string       // Identificador único del préstamo
    matricula_alumno: number  // Matrícula del alumno que solicita
    id_material: string       // ID del material prestado
    nombre_material: string   // Nombre del material
    materia: string          // Materia relacionada
    fecha_prestamo: Date     // Fecha en que se realizó el préstamo
    fecha_limite: Date       // Fecha límite de devolución
    estado: string           // Estado del préstamo (activo/devuelto)
}
```

### Clase Material (Implícita en la estructura de Firebase)
```javascript
class Material {
    id: string             // Identificador único del material
    nombre: string         // Nombre del material
    cantidad: number       // Cantidad disponible
    precio_unitario: number// Precio por unidad
    proveedor: string      // Proveedor del material
    tipo: string          // Tipo de material
}
```

## 3. Herencia

El proyecto utiliza el sistema de autenticación de Firebase que implementa la herencia a través de su gestión de usuarios:

```javascript
// Propiedades base del Usuario heredadas de Firebase Auth
class UsuarioBase {
    uid: string           // ID único del usuario en Firebase
    email: string         // Correo electrónico
    displayName: string   // Nombre para mostrar
}

// Clase Estudiante que hereda de usuario base
class UsuarioEstudiante extends UsuarioBase {
    matricula: number     // Número de matrícula
    carrera: string      // Carrera que estudia
}

// Clase Administrador que hereda de usuario base
class UsuarioAdmin extends UsuarioBase {
    isAdmin: boolean     // Indica si es administrador
}
```

## 4. Polimorfismo

El sistema implementa el polimorfismo de varias maneras:

### Polimorfismo de Sobrecarga
```javascript
class GestorPrestamos {
    // Método para crear préstamo con diferentes parámetros
    async crearPrestamo(matricula, idMaterial) {
        // Crear préstamo básico
        return this.crearPrestamoBase(matricula, idMaterial);
    }

    async crearPrestamo(matricula, idMaterial, fechaLimite) {
        // Crear préstamo con fecha límite específica
        return this.crearPrestamoBase(matricula, idMaterial, fechaLimite);
    }

    async crearPrestamo(matricula, idMaterial, fechaLimite, materia) {
        // Crear préstamo completo con materia
        return this.crearPrestamoBase(matricula, idMaterial, fechaLimite, materia);
    }
}
```

### Polimorfismo de Interfaz
```javascript
// Interfaz base para notificaciones
interface Notificador {
    enviarNotificacion(usuario: string, mensaje: string): void;
}

// Implementaciones específicas
class NotificadorEmail implements Notificador {
    enviarNotificacion(usuario: string, mensaje: string) {
        // Enviar notificación por email
        this.enviarEmail(usuario, mensaje);
    }
}

class NotificadorSMS implements Notificador {
    enviarNotificacion(usuario: string, mensaje: string) {
        // Enviar notificación por SMS
        this.enviarSMS(usuario, mensaje);
    }
}

// Uso del polimorfismo
class SistemaPrestamos {
    notificador: Notificador;

    constructor(tipoNotificacion: string) {
        this.notificador = tipoNotificacion === 'email' 
            ? new NotificadorEmail() 
            : new NotificadorSMS();
    }

    notificarVencimiento(usuario: string) {
        // El mismo método funciona para cualquier tipo de notificador
        this.notificador.enviarNotificacion(
            usuario,
            'Su préstamo está por vencer'
        );
    }
}
```

### Polimorfismo en Manejo de Materiales
```javascript
// Clase base para materiales
class MaterialBase {
    constructor(id, nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    calcularMulta(diasRetraso) {
        // Implementación base
        return diasRetraso * 10;
    }
}

// Diferentes tipos de materiales con comportamiento específico
class LibroTexto extends MaterialBase {
    calcularMulta(diasRetraso) {
        // Multa más alta para libros de texto
        return diasRetraso * 20;
    }
}

class MaterialLaboratorio extends MaterialBase {
    calcularMulta(diasRetraso) {
        // Multa especial para equipo de laboratorio
        return diasRetraso * 50;
    }
}
```

## 5. Getters y Setters (Acceso a Datos)

### En Gestión de Usuarios
```javascript
// Getter para obtener usuario actual
obtenerUsuarioActual() {
    return firebase.auth().currentUser;
}

// Setter para datos de usuario
async guardarDatosUsuario(datosUsuario) {
    await firebase.database().ref('alumno/' + datosUsuario.matricula).set(datosUsuario);
}
```

### En Gestión de Préstamos
```javascript
// Getter para préstamos
async obtenerPrestamosPorEstudiante(matricula) {
    const snapshot = await firebase.database()
        .ref('prestamos')
        .orderByChild('matricula_alumno')
        .equalTo(matricula)
        .once('value');
    return snapshot.val();
}

// Setter para estado del préstamo
async actualizarEstadoPrestamo(idPrestamo, estado) {
    await firebase.database()
        .ref('prestamos/' + idPrestamo)
        .update({ estado: estado });
}
```

### En Gestión de Materiales
```javascript
// Getter para materiales disponibles
async obtenerMateriales() {
    const snapshot = await firebase.database()
        .ref('materiales')
        .once('value');
    return snapshot.val();
}

// Setter para cantidad de material
async actualizarCantidadMaterial(idMaterial, cantidad) {
    await firebase.database()
        .ref('materiales/' + idMaterial)
        .update({ cantidad: cantidad });
}
```

## 6. Encapsulamiento de Datos

El proyecto implementa el encapsulamiento a través de las reglas de seguridad de Firebase y la estructura de la aplicación:

```javascript
// El acceso a datos está encapsulado mediante reglas de Firebase
{
    "rules": {
        "alumno": {
            ".read": "auth != null",  // Solo usuarios autenticados pueden leer
            ".write": "auth != null"  // Solo usuarios autenticados pueden escribir
        },
        "prestamos": {
            ".read": "auth != null",  // Solo usuarios autenticados pueden leer
            ".write": "auth != null"  // Solo usuarios autenticados pueden escribir
        },
        "materiales": {
            ".read": "auth != null",  // Solo usuarios autenticados pueden leer
            ".write": "auth != null && root.child('admins').child(auth.uid).exists()" // Solo administradores pueden modificar
        }
    }
}
```

## 7. Patrón Singleton

La configuración de Firebase utiliza el patrón Singleton para asegurar una única instancia de la aplicación Firebase:

```javascript
// Configuración de Firebase usando patrón Singleton
let app;
try {
    if (!firebase.apps.length) {
        // Si no existe una instancia, crear una nueva
        app = firebase.initializeApp(firebaseConfig);
    } else {
        // Si ya existe una instancia, usarla
        app = firebase.app();
    }
} catch (error) {
    console.error('Error de inicialización de Firebase:', error);
}
```

## 8. Patrón Observador

El sistema implementa el patrón Observador para los cambios en el estado de autenticación:

```javascript
// Observador del estado de autenticación
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Manejar estado de sesión iniciada
        actualizarInterfazUsuarioConectado(user);
    } else {
        // Manejar estado de sesión cerrada
        actualizarInterfazUsuarioDesconectado();
    }
});
```

Esta documentación proporciona una visión general de cómo se implementan los conceptos de programación orientada a objetos en el Sistema de Gestión de Biblioteca, aunque utiliza un enfoque más funcional y basado en servicios con Firebase como backend.

## 9. Ejemplos de Uso

### Crear un Nuevo Préstamo
```javascript
// Crear una instancia de préstamo
const nuevoPrestamo = {
    matricula_alumno: estudiante.matricula,
    id_material: material.id,
    fecha_prestamo: new Date(),
    fecha_limite: fechaLimite,
    estado: 'activo'
};

// Guardar en la base de datos
await firebase.database().ref('prestamos').push(nuevoPrestamo);
```

### Actualizar Estado de Material
```javascript
// Actualizar cantidad después de un préstamo
async function actualizarInventario(idMaterial) {
    const ref = firebase.database().ref(`materiales/${idMaterial}`);
    const material = await ref.once('value');
    await ref.update({
        cantidad: material.val().cantidad - 1
    });
}
```

## 10. Beneficios del Diseño Orientado a Objetos

1. **Modularidad**: Cada clase tiene una responsabilidad específica
2. **Reutilización**: Los componentes se pueden reutilizar en diferentes partes del sistema
3. **Mantenibilidad**: La estructura orientada a objetos facilita las actualizaciones y cambios
4. **Seguridad**: El encapsulamiento protege los datos sensibles
5. **Escalabilidad**: Fácil de extender con nuevas funcionalidades
