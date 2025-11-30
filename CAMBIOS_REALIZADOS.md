# Documentación de Cambios Realizados en el Sistema
## Club Atlético Deportivo Acarigua

**Fecha:** 29 de Noviembre de 2025  
**Proyecto:** Sistema de Gestión del Club Atlético Deportivo Acarigua  
**Propósito:** Documentación académica de cambios para proyecto universitario

---

## Resumen Ejecutivo

Se solucionaron múltiples problemas de conectividad y configuración que impedían el funcionamiento del sistema de autenticación. Los cambios incluyeron corrección de rutas de API, creación e importación de la base de datos, y ajustes en los parámetros de autenticación.

---

## 1. Problemas Identificados

### 1.1 Error de Rutas de API Incorrectas
- **Problema:** El frontend usaba rutas de demostración (`/vue-element-admin/user/*`) en lugar de las rutas reales del backend
- **Impacto:** Error 404 - Endpoints no encontrados
- **Archivo afectado:** `src/api/user.js`

### 1.2 Base de Datos No Existente
- **Problema:** La base de datos `club_atletico_acarigua` no estaba creada en MySQL
- **Impacto:** Error de conexión al servidor backend
- **Componente afectado:** MySQL/MariaDB

### 1.3 Servidor Backend No Iniciado
- **Problema:** No había proceso escuchando en el puerto 3000
- **Impacto:** Imposibilidad de comunicación frontend-backend
- **Componente afectado:** Node.js server

### 1.4 Incompatibilidad de Parámetros de Login
- **Problema:** Frontend enviaba `username` pero backend esperaba `email`
- **Impacto:** Error 400 - Bad Request en petición de login
- **Archivo afectado:** `src/store/modules/user.js`

---

## 2. Archivos Modificados

### 2.1 `src/api/user.js`

**Ubicación:** `c:\Users\Alejandro\Documents\Club-Atletico-Deportivo-Acarigua\src\api\user.js`

**Cambios realizados:**

```diff
export function login(data) {
  return request({
-   url: '/vue-element-admin/user/login',
+   url: '/usuarios/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
-   url: '/vue-element-admin/user/info',
+   url: '/usuarios/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
-   url: '/vue-element-admin/user/logout',
+   url: '/usuarios/logout',
    method: 'post'
  })
}
```

**Razón del cambio:**
- Las rutas originales apuntaban al mock server de vue-element-admin
- Se actualizaron para apuntar al backend real implementado en Node.js/Express
- La nueva configuración utiliza la `VUE_APP_BASE_API` definida en `.env.development` (`http://localhost:3000/api`)

**Resultado esperado:**
- `login()` → `POST http://localhost:3000/api/usuarios/login`
- `getInfo()` → `GET http://localhost:3000/api/usuarios/info`
- `logout()` → `POST http://localhost:3000/api/usuarios/logout`

---

### 2.2 `src/store/modules/user.js`

**Ubicación:** `c:\Users\Alejandro\Documents\Club-Atletico-Deportivo-Acarigua\src\store\modules\user.js`

**Cambios realizados:**

```diff
login({ commit }, userInfo) {
  const { username, password } = userInfo
  return new Promise((resolve, reject) => {
-   login({ username: username.trim(), password: password }).then(response => {
+   login({ email: username.trim(), password: password }).then(response => {
      const { data } = response
      commit('SET_TOKEN', data.token)
      setToken(data.token)
      resolve()
    }).catch(error => {
      reject(error)
    })
  })
},
```

**Razón del cambio:**
- El backend (archivo `server/routes/usuarios.js` línea 11) espera el parámetro `email` en el body de la petición
- El frontend enviaba `username` causando error 400 por validación fallida
- Se mantiene `username` como nombre de variable interna pero se envía como `email` al backend
- Esta solución preserva la compatibilidad con el formulario de login que usa campo "username"

**Validación en backend:**
```javascript
// server/routes/usuarios.js línea 11-17
const { email, password } = req.body;

if (!email || !password) {
    return res.status(400).json({
        code: 60001,
        message: 'Email y contraseña son requeridos'
    });
}
```

---

## 3. Base de Datos

### 3.1 Creación de la Base de Datos

**Comando ejecutado:**
```bash
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS club_atletico_acarigua CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Detalles:**
- **Motor:** MySQL/MariaDB (vía XAMPP)
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci
- **Razón:** Soporte completo para caracteres especiales y emojis

### 3.2 Importación del Schema y Datos

**Comando ejecutado:**
```bash
Get-Content "database\club_atletico_acarigua.sql" | C:\xampp\mysql\bin\mysql.exe -u root club_atletico_acarigua
```

**Archivo importado:** `database/club_atletico_acarigua.sql`

**Tablas creadas:**
1. `usuarios` - Gestión de usuarios del sistema
2. `atletas` - Información de los atletas
3. `categoria` - Categorías deportivas
4. `tutor` - Tutores/representantes
5. `control_asistencias` - Registro de asistencias
6. `ficha_medica` - Fichas médicas de atletas
7. `pagos` - Control de pagos
8. `plantel` - Personal del club
9. `test_de_rendimiento` - Tests físicos
10. `medidas_antropometricas` - Medidas físicas
11. `implementos_deportivos` - Inventario de equipamiento
12. `grafica_de_rendimiento` - Gráficas de evolución

### 3.3 Creación de Usuario Administrador

**Comando ejecutado:**
```sql
INSERT INTO usuarios (EMAIL, PASSWORD, ROL, ESTATUS) 
VALUES ('admin', '111111', 'ADMIN', 'ACTIVO');
```

**Credenciales creadas:**
- **Usuario:** admin
- **Contraseña:** 111111 (sin hash - pendiente implementar bcrypt en producción)
- **Rol:** ADMIN
- **Estado:** ACTIVO

**⚠️ Nota de Seguridad:**
La contraseña está almacenada en texto plano. Para producción se recomienda:
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('111111', 10);
```

---

## 4. Configuraciones del Sistema

### 4.1 Variables de Entorno - Backend

**Archivo:** `server/.env`

```env
# Configuración del Servidor
PORT=3000

# Configuración de la Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=club_atletico_acarigua
DB_PORT=3306

# JWT Secret
JWT_SECRET=club_atletico_acarigua_secret_key_2025
```

**Descripción:**
- **PORT:** Puerto donde corre el servidor Express
- **DB_HOST:** Servidor MySQL (localhost para desarrollo)
- **DB_USER:** Usuario de MySQL (root por defecto en XAMPP)
- **DB_PASSWORD:** Sin contraseña en desarrollo local
- **DB_NAME:** Nombre de la base de datos
- **DB_PORT:** Puerto estándar de MySQL
- **JWT_SECRET:** Clave para firmar tokens JWT (8 horas de expiración)

### 4.2 Variables de Entorno - Frontend

**Archivo:** `.env.development`

```env
# just a flag
ENV = 'development'

# base api
VUE_APP_BASE_API = 'http://localhost:3000/api'
```

**Descripción:**
- **ENV:** Indicador de ambiente de desarrollo
- **VUE_APP_BASE_API:** URL base para todas las peticiones API del frontend

---

## 5. Arquitectura del Sistema

### 5.1 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (Vue)
    participant B as Backend (Express)
    participant D as Database (MySQL)

    U->>F: Ingresa credenciales (admin/111111)
    F->>F: Valida formato (mín 6 caracteres)
    F->>B: POST /api/usuarios/login {email, password}
    B->>D: SELECT * FROM usuarios WHERE EMAIL=?
    D-->>B: Retorna datos del usuario
    B->>B: Verifica password (comparación directa)
    B->>B: Genera JWT token
    B->>D: UPDATE usuarios SET TOKEN=?, ULTIMO_ACCESO=NOW()
    B-->>F: {code:20000, data:{token, user}}
    F->>F: Guarda token en localStorage
    F->>F: Commit SET_TOKEN en Vuex
    F->>B: GET /api/usuarios/info (con X-Token header)
    B->>B: Verifica JWT
    B->>D: SELECT info del usuario
    D-->>B: Retorna datos
    B-->>F: {code:20000, data:{roles, name, avatar}}
    F->>F: Actualiza estado de usuario en Vuex
    F-->>U: Redirige a /dashboard
```

### 5.2 Estructura de Headers HTTP

**Request Headers (Frontend → Backend):**
```http
POST /api/usuarios/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json
X-Token: <jwt-token-si-existe>

{
  "email": "admin",
  "password": "111111"
}
```

**Response Headers (Backend → Frontend):**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8

{
  "code": 20000,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 6,
      "email": "admin",
      "rol": "ADMIN",
      "estatus": "ACTIVO"
    }
  }
}
```

---

## 6. Pruebas Realizadas

### 6.1 Prueba de Conectividad del Servidor

**Comando:**
```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "message": "Servidor funcionando correctamente",
  "database": "Conectado"
}
```

**Resultado:** ✅ Exitoso

### 6.2 Prueba de Login

**Comando:**
```bash
curl -Method POST -Uri "http://localhost:3000/api/usuarios/login" 
     -ContentType "application/json" 
     -Body '{"email":"admin","password":"111111"}'
```

**Respuesta esperada:**
```json
{
  "code": 20000,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJhZG1pbiIsInJvbCI6IkFETUlOIiwiaWF0IjoxNzY0NDczMzQ4LCJleHAiOjE3NjQ1MDIxNDh9.XQeFigh5n5GF-k_WwMxaN3Pci61PHsny-p1...",
    "user": {
      "id": 6,
      "email": "admin",
      "rol": "ADMIN",
      "estatus": "ACTIVO"
    }
  }
}
```

**Resultado:** ✅ Exitoso

### 6.3 Consulta de Usuarios en Base de Datos

**Comando:**
```sql
SELECT USUARIO_ID, EMAIL, PASSWORD, ROL, ESTATUS FROM usuarios;
```

**Resultado:**
| USUARIO_ID | EMAIL | PASSWORD | ROL | ESTATUS |
|------------|-------|----------|-----|---------|
| 1 | test@gmail.com | 123456 | ADMIN | ACTIVO |
| 2 | alo | alo | ENTRENADOR | ACTIVO |
| 5 | dsadasdad | 1211111 | ADMIN | ACTIVO |
| 6 | admin | 111111 | ADMIN | ACTIVO |

**Estado:** ✅ Usuario admin creado correctamente

---

## 7. Comandos para Iniciar el Sistema

### 7.1 Requisitos Previos

1. **XAMPP iniciado con MySQL activo**
   - Abrir Panel de Control de XAMPP
   - Iniciar módulo MySQL

2. **Dependencias instaladas**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ..
   npm install
   ```

### 7.2 Iniciar Backend

**Opción 1 - Directa:**
```bash
cd server
node index.js
```

**Opción 2 - Con npm (si las políticas de PowerShell lo permiten):**
```bash
cd server
npm start
```

**Salida esperada:**
```
🚀 Servidor corriendo en http://localhost:3000
📊 Base de datos: club_atletico_acarigua
✅ Conexión exitosa a la base de datos MySQL
```

### 7.3 Iniciar Frontend

```bash
npm run dev
```

**Salida esperada:**
```
  App running at:
  - Local:   http://localhost:9527/
  - Network: http://192.168.x.x:9527/
```

### 7.4 Acceder al Sistema

1. Abrir navegador en `http://localhost:9527`
2. Ingresar credenciales:
   - **Usuario:** admin
   - **Contraseña:** 111111
3. Click en "Iniciar Sesión"
4. Redirección automática a `/dashboard`

---

## 8. Middlewares y Seguridad

### 8.1 Middleware de Autenticación

**Archivo:** `server/middleware/auth.js`

**Función:** `verificarToken`
```javascript
const verificarToken = (req, res, next) => {
    const token = req.header('X-Token') || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            code: 50008,
            message: 'No se proporcionó token de autenticación'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            code: 50014,
            message: 'Token inválido o expirado'
        });
    }
};
```

**Códigos de error:**
- `50008` - No se proporcionó token
- `50014` - Token inválido o expirado

### 8.2 Middleware de Autorización

**Función:** `verificarAdmin`
```javascript
const verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'ADMIN') {
        return res.status(403).json({
            code: 50012,
            message: 'No tienes permisos para realizar esta acción'
        });
    }
    next();
};
```

**Uso en rutas:**
```javascript
router.post('/registro', verificarToken, verificarAdmin, async (req, res) => {
    // Solo usuarios con rol ADMIN pueden crear usuarios
});
```

---

## 9. Códigos de Respuesta del Backend

### 9.1 Códigos de Éxito

| Código | Descripción |
|--------|-------------|
| 20000 | Operación exitosa |

### 9.2 Códigos de Error de Cliente (4xx)

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| 60001 | Email y contraseña requeridos | 400 |
| 60002 | Credenciales incorrectas | 401 |
| 60003 | Usuario no encontrado | 404 |
| 60004 | Campos requeridos faltantes | 400 |
| 60005 | Email ya registrado | 400 |

### 9.3 Códigos de Error de Servidor (5xx)

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| 50000 | Error interno del servidor | 500 |
| 50008 | Token no proporcionado | 401 |
| 50012 | Sin permisos | 403 |
| 50014 | Token inválido o expirado | 401 |

---

## 10. Estructura de Directorios Relevante

```
Club-Atletico-Deportivo-Acarigua/
├── server/
│   ├── config/
│   │   └── database.js          # Configuración MySQL pool
│   ├── middleware/
│   │   └── auth.js              # Middlewares de autenticación
│   ├── routes/
│   │   ├── usuarios.js          # ✏️ Rutas de autenticación
│   │   ├── atletas.js
│   │   ├── categorias.js
│   │   ├── asistencias.js
│   │   ├── pagos.js
│   │   ├── plantel.js
│   │   └── tutores.js
│   ├── .env                     # ✏️ Variables de entorno
│   ├── index.js                 # Servidor Express principal
│   └── package.json
├── src/
│   ├── api/
│   │   └── user.js              # ✏️ MODIFICADO - Rutas API corregidas
│   ├── store/
│   │   └── modules/
│   │       └── user.js          # ✏️ MODIFICADO - Parámetro email corregido
│   ├── views/
│   │   ├── login/
│   │   │   └── index.vue        # Formulario de login
│   │   └── dashboard/
│   │       └── index.vue        # Dashboard principal
│   └── utils/
│       ├── request.js           # Configuración axios
│       └── auth.js              # Funciones de tokens
├── database/
│   └── club_atletico_acarigua.sql  # Schema de base de datos
├── .env.development             # Config frontend desarrollo
└── vue.config.js
```

**Leyenda:**
- ✏️ = Archivo modificado en esta sesión
- 🆕 = Archivo creado en esta sesión

---

## 11. Tecnologías Utilizadas

### 11.1 Frontend
- **Framework:** Vue.js 2.x
- **UI Library:** Element UI
- **State Management:** Vuex
- **HTTP Client:** Axios
- **Build Tool:** Webpack (via Vue CLI)
- **Router:** Vue Router

### 11.2 Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database Driver:** mysql2 (con promises)
- **Authentication:** jsonwebtoken (JWT)
- **Password Hashing:** bcryptjs (pendiente de implementar)
- **Validation:** express-validator
- **Environment:** dotenv
- **CORS:** cors middleware

### 11.3 Base de Datos
- **DBMS:** MySQL/MariaDB (via XAMPP)
- **Version:** 10.1.38-MariaDB
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci

---

## 12. Roles del Sistema

### 12.1 ADMIN (Administrador)
**Permisos:**
- Acceso completo a todas las funcionalidades
- Gestión de usuarios del sistema
- Gestión de plantel técnico
- Todas las operaciones CRUD en todas las tablas

**Rutas permitidas:** Todas

### 12.2 ENTRENADOR
**Permisos:**
- Gestión de atletas
- Control de asistencias
- Gestión de fichas médicas
- Tests de rendimiento
- Vista de pagos (solo lectura)
- Vista de tutores (solo lectura)

**Rutas restringidas:** 
- Gestión de usuarios
- Gestión de plantel

### 12.3 USUARIO (Tutor/Padre)
**Permisos:**
- Vista de información de sus atletas (hijos)
- Vista de asistencias de sus atletas
- Vista de pagos de sus atletas
- Vista de fichas médicas de sus atletas

**Restricciones:**
- Solo lectura
- Filtrado por `TUTOR_ID`

---

## 13. Recomendaciones para Producción

### 13.1 Seguridad

1. **Hashear contraseñas:**
   ```javascript
   // En registro
   const hashedPassword = await bcrypt.hash(password, 10);
   
   // En login
   const isValid = await bcrypt.compare(password, usuario.PASSWORD);
   ```

2. **Variables de entorno seguras:**
   - Generar JWT_SECRET aleatorio y fuerte
   - Usar contraseña de base de datos
   - No versionar archivo `.env`

3. **HTTPS:**
   - Implementar certificados SSL/TLS
   - Forzar conexiones seguras

4. **Rate Limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 5 // 5 intentos
   });
   ```

### 13.2 Base de Datos

1. **Índices:**
   - Ya implementados en `usuarios.EMAIL`
   - Considerar índices en campos de búsqueda frecuente

2. **Backups:**
   - Implementar respaldos automáticos diarios
   - Probar restauración periódicamente

3. **Migraciones:**
   - Usar herramientas como Sequelize migrations
   - Control de versiones del schema

### 13.3 Logging y Monitoreo

1. **Logs estructurados:**
   ```javascript
   const winston = require('winston');
   logger.info('Login exitoso', { userId: usuario.USUARIO_ID });
   ```

2. **Monitoreo de errores:**
   - Implementar Sentry o similar
   - Alertas de errores críticos

---

## 14. Troubleshooting

### 14.1 Error: "Request failed with status code 400"
**Causa:** Parámetros incorrectos en la petición  
**Solución:** Verificar que se envíe `email` y no `username` al backend

### 14.2 Error: "Unable to connect to the remote server"
**Causa:** Servidor backend no está corriendo  
**Solución:** Ejecutar `node index.js` en carpeta `server`

### 14.3 Error: "Unknown database 'club_atletico_acarigua'"
**Causa:** Base de datos no existe  
**Solución:** Crear BD e importar SQL como se documenta en sección 3

### 14.4 Error: "Cannot run scripts (PowerShell)"
**Causa:** Política de ejecución de PowerShell  
**Solución:** Usar `node index.js` directamente en lugar de `npm start`

---

## 15. Historial de Cambios

| Fecha | Cambio | Archivo | Tipo |
|-------|--------|---------|------|
| 2025-11-29 | Corregir rutas de API | `src/api/user.js` | Modificación |
| 2025-11-29 | Corregir parámetro login | `src/store/modules/user.js` | Modificación |
| 2025-11-29 | Crear base de datos | MySQL | Creación |
| 2025-11-29 | Importar schema | `database/club_atletico_acarigua.sql` | Importación |
| 2025-11-29 | Crear usuario admin | Tabla `usuarios` | Inserción |

---

## 16. Conclusiones

### 16.1 Problemas Resueltos

✅ Sistema de autenticación funcional  
✅ Conexión frontend-backend establecida  
✅ Base de datos creada y poblada  
✅ Usuario administrador disponible  
✅ Arquitectura de seguridad implementada

### 16.2 Estado Actual del Proyecto

El sistema está **operativo** en ambiente de desarrollo con las siguientes características:

- ✅ Login funcional con JWT
- ✅ Base de datos completa con 12 tablas
- ✅ 3 roles de usuario definidos
- ⏳ Vistas del dashboard pendientes de desarrollo
- ⏳ Sistema de menús dinámicos por rol pendiente
- ⏳ Módulos CRUD pendientes de implementación

### 16.3 Próximos Pasos Sugeridos

1. Implementar sistema de menús dinámicos basado en roles
2. Crear vistas para gestión de atletas
3. Desarrollar módulo de control de asistencias
4. Implementar gestión de pagos
5. Crear módulo de fichas médicas
6. Desarrollar tests de rendimiento y gráficas
7. Hashear contraseñas con bcrypt
8. Implementar validaciones robustas
9. Agregar manejo de errores mejorado
10. Documentar APIs con Swagger

---

## 17. Referencias y Recursos

- **Vue.js Documentation:** https://vuejs.org/
- **Element UI:** https://element.eleme.io/
- **Express.js:** https://expressjs.com/
- **JSON Web Tokens:** https://jwt.io/
- **MySQL Documentation:** https://dev.mysql.com/doc/

---

## Anexos

### A. Estructura Completa de la Base de Datos

Ver archivo: `database/club_atletico_acarigua.sql`

### B. Endpoints del Backend

**Autenticación:**
- `POST /api/usuarios/login` - Iniciar sesión
- `GET /api/usuarios/info` - Obtener info del usuario (autenticado)
- `POST /api/usuarios/logout` - Cerrar sesión (autenticado)
- `POST /api/usuarios/registro` - Crear usuario (admin)
- `GET /api/usuarios` - Listar usuarios (admin)

**Recursos:**
- `GET|POST|PUT|DELETE /api/atletas` - CRUD atletas
- `GET|POST|PUT|DELETE /api/categorias` - CRUD categorías
- `GET|POST|PUT|DELETE /api/asistencias` - CRUD asistencias
- `GET|POST|PUT|DELETE /api/pagos` - CRUD pagos
- `GET|POST|PUT|DELETE /api/plantel` - CRUD plantel
- `GET|POST|PUT|DELETE /api/tutores` - CRUD tutores

---

**Documento generado el:** 29 de Noviembre de 2025  
**Versión:** 1.0  
**Autor técnico:** Sistema de IA - Antigravity  
**Proyecto académico:** Club Atlético Deportivo Acarigua - UPTP
