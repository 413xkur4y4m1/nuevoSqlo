SISTEMA DE GESTIÓN DE PRÉSTAMOS Y ADEUDOS
=======================================

Este documento proporciona información detallada sobre la instalación, configuración y uso del sistema.

ÍNDICE
------
1. Descripción general
2. Requisitos previos
3. Instalación
4. Configuración
5. Estructura del proyecto
6. Funcionalidades
7. Guía de uso
8. Solución de problemas

1. DESCRIPCIÓN GENERAL
---------------------
El sistema permite gestionar préstamos de materiales y adeudos para una institución educativa, utilizando Firebase como backend. Incluye autenticación de usuarios, gestión de préstamos, seguimiento de adeudos y generación de códigos QR.

2. REQUISITOS PREVIOS
--------------------
- Node.js (versión 14 o superior)
- npm (viene con Node.js)
- Cuenta de Firebase
- Navegador web moderno
- Visual Studio Code (recomendado para desarrollo)

3. INSTALACIÓN
-------------
1. Clonar o descargar el proyecto
2. Abrir una terminal en la carpeta del proyecto
3. Ejecutar los siguientes comandos:
   ```
   npm install
   npm install tesseract.js@^4.1.1 --save
   ```

4. CONFIGURACIÓN
---------------
A. Configuración de Firebase:
1. Crear un nuevo proyecto en Firebase Console (console.firebase.google.com)
2. Habilitar Authentication con proveedor de Microsoft
3. Habilitar Realtime Database
4. En Realtime Database, configurar las reglas de seguridad:
   ```json
   {
     "rules": {
       "alumno": {
         ".read": "auth != null",
         ".write": "auth != null"
       },
       "adeudos": {
         ".read": "auth != null",
         ".write": "auth != null"
       },
       "prestamos": {
         ".read": "auth != null",
         ".write": "auth != null"
       },       "materia11": {
         ".read": "true",
         ".write": "auth != null"
       }
     }
   }
   ```

B. Estructura de la base de datos:
La base de datos debe tener la siguiente estructura en Realtime Database:

materia11/
    nombre: string
    cantidad: number
    precio_unitario: number
    proveedor: string
    tipo: string

alumno/
  [id]/
    nombre: string
    apellido_p: string
    apellido_m: string
    carrera: string
    email: string
    matricula: number
    fecha_registro: timestamp
    fecha_alta: string
    modo: string

adeudos/
  [id]/
    descripcion: string
    fecha_adeudo: string
    monto: number
    matricula_alumno: number
    estado: string

prestamos/
  [id]/
    matricula_alumno: number
    id_material: string
    fecha_prestamo: string
    fecha_limite: string
    materia: string
    estado: string

5. ESTRUCTURA DEL PROYECTO
-------------------------
/
├── adeudo.html         # Página para registrar adeudos
├── adeudos.html        # Lista de adeudos
├── alumno.html         # Registro y gestión de alumnos
├── prestamos.html      # Registro de préstamos
├── lista-prestamos.html # Lista de préstamos activos
├── lista-adeudos.html  # Lista de adeudos pendientes
├── js/
│   ├── firebase-config.js # Configuración de Firebase
│   ├── prestamos.js      # Lógica de préstamos
│   └── lista-alumnos.js  # Lógica de listado de alumnos
└── server.js           # Servidor Express para desarrollo local

6. FUNCIONALIDADES
-----------------
- Registro de alumnos con autenticación Microsoft
- Gestión de préstamos de materiales
- Seguimiento de adeudos
- Generación de códigos QR para préstamos
- Lista de préstamos activos
- Lista de adeudos pendientes
- Interfaz responsive y amigable
- Procesamiento de imágenes con OCR (Reconocimiento Óptico de Caracteres)
- Validación y manejo seguro de archivos

7. CARACTERÍSTICAS TÉCNICAS ADICIONALES
------------------------------------
A. Procesamiento de Imágenes:
   - Tesseract.js para OCR
   - Soporte para múltiples formatos de imagen
   - Límite de tamaño de archivo: 5MB
   - Validación automática de tipos MIME
   - Nombres de archivo únicos para evitar colisiones
   - Limpieza automática de archivos temporales

B. Manejo Seguro de Archivos:
   - Validación de tipos MIME
   - Límites de tamaño configurables
   - Directorio de uploads con permisos seguros
   - Limpieza automática de archivos temporales
   - Manejo de errores robusto
   - Feedback detallado al usuario

C. Configuración del Sistema de Archivos:
   ```javascript
   const storage = multer.diskStorage({
     destination: './uploads/',
     filename: (req, file, cb) => {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
       cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
     }
   });
   ```

8. GUÍA DE USO
-------------
A. Preparación del Proyecto:

1. Clonar el repositorio o copiar los archivos a tu directorio local
2. Verificar que tienes la siguiente estructura de archivos:
   ```
   tu-directorio/
   ├── adeudo.html
   ├── adeudos.html
   ├── alumno.html
   ├── lista-adeudos.html
   ├── lista-prestamos.html
   ├── prestamos.html
   ├── firebase.json
   ├── package.json
   └── js/
       ├── firebase-config.js
       ├── lista-alumnos.js
       └── prestamos.js
   ```

B. Configuración Inicial:

1. Instalar Node.js desde https://nodejs.org (versión 14 o superior)

2. Abrir una terminal PowerShell en tu directorio y ejecutar:
   ```powershell
   npm install
   ```

3. Instalar Firebase CLI globalmente:
   ```powershell
   npm install -g firebase-tools
   ```

4. Iniciar sesión en Firebase:
   ```powershell
   firebase login
   ```

5. Crear un nuevo proyecto en Firebase Console (https://console.firebase.google.com)
   - Anotar las credenciales del proyecto
   - Habilitar Authentication con Microsoft
   - Habilitar Realtime Database
   - Configurar las reglas de seguridad en Realtime Database

6. Actualizar las credenciales de Firebase en js/firebase-config.js con tus propias credenciales:
   ```javascript
   const firebaseConfig = {
     apiKey: "TU_API_KEY",
     authDomain: "TU_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://TU_PROJECT_ID-default-rtdb.firebaseio.com",
     projectId: "TU_PROJECT_ID",
     storageBucket: "TU_PROJECT_ID.appspot.com",
     messagingSenderId: "TU_SENDER_ID",
     appId: "TU_APP_ID"
   };
   ```

C. Estructura del Realtime Database:
Configurar la siguiente estructura en tu base de datos:

```
/materiales
  /[id_material]
    nombre: string
    cantidad: number
    precio_unitario: number
    proveedor: string
    tipo: string

/adeudos
  /[id_adeudo]
    descripcion: string
    fecha_adeudo: string
    monto: number
    matricula_alumno: number
    estado: string

/alumno
  /[id_alumno]
    nombre: string
    apellido_p: string
    apellido_m: string
    carrera: string
    email: string
    matricula: number
    fecha_registro: timestamp
    fecha_alta: string
    modo: string

/prestamos
  /[id_prestamo]
    matricula_alumno: number
    id_material: string
    fecha_prestamo: string
    fecha_limite: string
    materia: string
    estado: string
```

D. Despliegue en Firebase:

1. Inicializar Firebase en tu directorio:
   ```powershell
   firebase init
   ```
   - Seleccionar "Hosting" y "Realtime Database"
   - Elegir tu proyecto
   - Usar "." como directorio público
   - Configurar como aplicación de página única: No
   - No sobrescribir archivos existentes

2. Verificar el archivo firebase.json:
   ```json
   {
     "hosting": {
       "public": ".",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**",
         "package.json",
         "package-lock.json",
         "server.js",
         "README.txt",
         "uploads/**"
       ]
     }
   }
   ```

3. Desplegar a Firebase:
   ```powershell
   firebase deploy --only hosting
   ```

E. Actualización del Sitio:

Para actualizar cambios en el sitio:
1. Realizar cambios en los archivos locales
2. Probar localmente ejecutando:
   ```powershell
   npm run dev
   ```
3. Una vez verificados los cambios, desplegar:
   ```powershell
   firebase deploy --only hosting
   ```

C. Uso del sistema:
1. Registro de alumnos:
   - Acceder a alumno.html
   - Iniciar sesión con cuenta Microsoft
   - Completar el formulario de registro

2. Gestión de préstamos:
   - Acceder a prestamos.html
   - Seleccionar material
   - Establecer fecha límite
   - Generar préstamo y código QR

3. Gestión de adeudos:
   - Acceder a adeudo.html
   - Ingresar datos del adeudo
   - Registrar el adeudo

8. SOLUCIÓN DE PROBLEMAS
-----------------------
- Error de autenticación:
  * Verificar configuración de Firebase
  * Comprobar permisos de autenticación Microsoft

- Error en base de datos:
  * Verificar reglas de seguridad en Firebase
  * Comprobar estructura de datos

- Problemas con el servidor local:
  * Verificar que el puerto 3000 esté disponible
  * Reiniciar el servidor

- Problemas con el procesamiento de imágenes:
  * Verificar que Tesseract.js está instalado correctamente
  * Comprobar que el formato de imagen es soportado (PNG, JPG, JPEG)
  * Verificar permisos del directorio 'uploads'
  * Asegurarse de que el tamaño del archivo no excede 5MB
  * Revisar los logs del servidor para mensajes de error específicos

Para soporte adicional, consultar:
- Documentación de Firebase: https://firebase.google.com/docs
- Documentación de Tesseract.js: https://github.com/naptha/tesseract.js

NOTAS DE SEGURIDAD
-----------------
- Mantener las credenciales de Firebase seguras
- No compartir las claves de API
- Realizar copias de seguridad regulares de la base de datos
- Mantener el sistema actualizado


DOCUMENTACIÓN TÉCNICA Y CASOS DE USO
----------------------------------

1. CASOS DE USO
--------------

1.1 Gestión de Alumnos:
    Actor: Administrador
    Casos de uso:
    - Registrar nuevo alumno
    - Consultar información de alumno
    - Actualizar datos de alumno
    - Dar de baja alumno

    Flujo principal (Registro de alumno):
    1. Administrador accede a alumno.html
    2. Sistema solicita autenticación Microsoft
    3. Administrador ingresa datos del alumno
    4. Sistema valida datos
    5. Sistema genera matrícula automática
    6. Sistema registra alumno en Firebase

1.2 Gestión de Préstamos:
    Actor: Administrador, Alumno
    Casos de uso:
    - Solicitar préstamo
    - Registrar préstamo
    - Consultar préstamos activos
    - Devolver material
    - Generar QR de préstamo

    Flujo principal (Registro de préstamo):
    1. Admin accede a prestamos.html
    2. Selecciona alumno por matrícula
    3. Selecciona material a prestar
    4. Establece fecha límite
    5. Sistema genera QR
    6. Sistema registra préstamo en Firebase

1.3 Gestión de Adeudos:
    Actor: Administrador
    Casos de uso:
    - Registrar adeudo
    - Consultar adeudos
    - Marcar adeudo como pagado
    - Generar reporte de adeudos

    Flujo principal (Registro de adeudo):
    1. Admin accede a adeudo.html
    2. Ingresa matrícula del alumno
    3. Ingresa detalles del adeudo
    4. Sistema registra adeudo en Firebase

2. ARQUITECTURA DEL SISTEMA
-------------------------

2.1 Capas de la Aplicación:

    a) Capa de Presentación (Frontend):
       - HTML5 para estructura
       - CSS3 para estilos
       - JavaScript para interactividad
       - Componentes principales:
         * Formularios de registro
         * Visualización de listas
         * Generación de QR
         * Interfaces de usuario

    b) Capa de Datos (Backend):
       - Firebase Realtime Database
       - Estructura NoSQL
       - Autenticación Microsoft
       - Reglas de seguridad

2.2 Flujo de Datos:
    
    Usuario -> Interfaz Web -> Firebase Auth -> Firebase Realtime Database
                     ↑                                    ↓
                     └────────────── Respuesta ──────────┘

3. PATRONES Y PRÁCTICAS
----------------------

3.1 Patrones de Diseño:
    - Observer Pattern (para tiempo real con Firebase)
    - Singleton (configuración Firebase)
    - Factory (creación de objetos)

3.2 Prácticas de Código:
    - Validación de entrada de datos
    - Manejo de errores
    - Feedback al usuario
    - Código comentado y documentado

4. INTEGRACIÓN CON FIREBASE
-------------------------

4.1 Autenticación:
```javascript
// Ejemplo de autenticación Microsoft
firebase.auth().signInWithPopup(provider)
  .then((result) => {
    // Manejo de sesión
  })
  .catch((error) => {
    // Manejo de errores
  });
```

4.2 Operaciones CRUD:
```javascript
// Crear nuevo registro
const newRef = firebase.database().ref('colección').push();
newRef.set(datos);

// Leer datos
firebase.database().ref('colección').once('value')
  .then(snapshot => {
    const datos = snapshot.val();
  });

// Actualizar registro
firebase.database().ref('colección/' + id).update(datos);

// Eliminar registro
firebase.database().ref('colección/' + id).remove();
```

5. PRUEBAS Y CALIDAD
-------------------

5.1 Escenarios de Prueba:

    Registro de Alumno:
    - Datos válidos -> Registro exitoso
    - Datos inválidos -> Mensaje de error
    - Matrícula duplicada -> Mensaje de error
    - Campos vacíos -> Validación Frontend

    Préstamos:
    - Material disponible -> Préstamo exitoso
    - Material no disponible -> Mensaje error
    - Alumno con adeudos -> Bloqueo préstamo
    - QR generado -> Validación contenido

    Adeudos:
    - Registro correcto -> Actualización BD
    - Pago registrado -> Actualización estado
    - Consulta adeudos -> Filtrado correcto

5.2 Métricas de Calidad:
    - Tiempo de respuesta < 2s
    - Disponibilidad 99.9%
    - Tasa de errores < 1%
    - Cobertura de código > 80%

6. EXTENSIBILIDAD
---------------

6.1 Puntos de Extensión:
    - Nuevos tipos de materiales
    - Reportes adicionales
    - Integración con otros sistemas
    - Nuevos métodos de autenticación

6.2 Configuraciones Personalizables:
    - Reglas de préstamos
    - Políticas de adeudos
    - Formatos de reportes
    - Diseño de interfaz
