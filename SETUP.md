# ⚙️ Guía de Configuración e Inicio del Sistema - Club Atlético Deportivo Acarigua

Esta guía detalla los pasos necesarios para mantener, configurar y ejecutar el sistema de forma correcta.

---

## 🔄 1. Cómo Actualizar el Proyecto
Si otros compañeros han subido cambios, sigue estos pasos **antes** de arrancar el sistema para asegurar que tienes la última versión:

1. **Abrir la terminal** en la carpeta raíz del proyecto.
2. Ejecutar el comando para descargar los cambios:
   ```bash
   git pull
   ```
3. **Actualizar dependencias** (Solo si se agregaron nuevas librerías o si el sistema falla al iniciar):
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

---

## 🚀 2. Cómo Ejecutar el Sistema
Para que la aplicación funcione, deben estar corriendo tanto el servidor (backend) como la interfaz (frontend).

### Terminal 1 - Backend (Servidor API):
```bash
cd backend
npm run dev
```
El servidor estará disponible en: `http://localhost:3000`

### Terminal 2 - Frontend (Interfaz Web):
```bash
npm run dev
```
La aplicación se abrirá en: `http://localhost:9527` (o el puerto que indique la terminal).

---

## 👥 3. Credenciales de Acceso (Usuarios Iniciales)

| Correo Electrónico | Contraseña | Rol / Perfil |
| :--- | :--- | :--- |
| **directivo@gmail.com** | 12345678 | Súper Usuario |
| **admin@gmail.com** | 12345678 | Administrador |
| **entrenador@gmail.com** | 12345678 | Entrenador |
| **medico@gmail.com** | 12345678 | Médico (Rol reservado) |

> [!NOTE]
> El usuario **Administrador** tiene permisos para gestionar fichas médicas mientras el club no cuente con un médico de planta fijo.

---

## 📊 4. Estructura de Datos (Tablas Principales)
El sistema utiliza una base de datos MySQL denominada `cada_db`. Las tablas clave son:
- **usuarios**: Autenticación y roles (JWT).
- **atletas**: Datos personales y de contacto.
- **ficha_medica**: Historial clínico y alergias.
- **medidas_antropometricas**: Peso, altura e IMC.
- **tests_rendimiento**: Resultados de pruebas físicas.
- **asistencias**: Control diario por categoría.
- **plantel**: Personal técnico y directivo.

---

## 🛠️ 5. Configuración de Conexión
Si necesitas cambiar los datos de acceso a tu base de datos local (XAMPP/WAMP), edita el siguiente archivo:

**Archivo:** `backend/config/database.js`
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',      // Tu usuario de MySQL
  password: '',      // Tu contraseña de MySQL
  database: 'cada_db'
};
```

---

## ⚠️ Notas de Mantenimiento
1. **Servicios**: Asegúrate de que MySQL y Apache estén activos en tu panel de control (XAMPP).
2. **Reimportación**: Si necesitas limpiar y reiniciar la base de datos a su estado original, ejecuta:
   ```bash
   cd backend/database
   node import_database.js
   ```
