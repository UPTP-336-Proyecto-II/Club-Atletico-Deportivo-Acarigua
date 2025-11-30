# Backend - Club Atlético Deportivo Acarigua

API REST para el sistema de gestión del Club Atlético Deportivo Acarigua, construida con Node.js, Express y MySQL.

## 📋 Requisitos Previos

- **Node.js** (v14 o superior)
- **MySQL** o **MariaDB** (v5.7 o superior)
- **XAMPP** (recomendado para Windows, incluye MySQL y phpMyAdmin)

## 🚀 Instalación

### 1. Instalar dependencias del backend

```bash
cd server
npm install
```

### 2. Configurar la base de datos

#### Opción A: Usando XAMPP (Recomendado para Windows)

1. Descarga e instala [XAMPP](https://www.apachefriends.org/es/download.html)
2. Abre el Panel de Control de XAMPP
3. Inicia **Apache** y **MySQL**
4. Abre http://localhost/phpmyadmin en tu navegador
5. Crea una nueva base de datos llamada `club_atletico_acarigua`
6. Ve a la pestaña "Importar"
7. Selecciona el archivo `../database/club_atletico_acarigua.sql`
8. Haz clic en "Continuar"

#### Opción B: Usando MySQL desde línea de comandos

```bash
# Crear la base de datos
mysql -u root -p -e "CREATE DATABASE club_atletico_acarigua CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importar el archivo SQL
mysql -u root -p club_atletico_acarigua < ../database/club_atletico_acarigua.sql
```

### 3. Configurar variables de entorno

El archivo `.env` ya está creado con valores por defecto. Si necesitas cambiar algo:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # Deja vacío si no tiene contraseña
DB_NAME=club_atletico_acarigua
DB_PORT=3306
JWT_SECRET=club_atletico_acarigua_secret_key_2025
```

## ▶️ Ejecutar el servidor

```bash
# Desde la carpeta server/
npm start
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
📊 Base de datos: club_atletico_acarigua
✅ Conexión exitosa a la base de datos MySQL
```

## 🔌 Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/usuarios/login` | Iniciar sesión | ❌ |
| POST | `/api/usuarios/logout` | Cerrar sesión | ✅ |
| GET | `/api/usuarios/info` | Info del usuario actual | ✅ |
| POST | `/api/usuarios/registro` | Registrar usuario (admin) | ✅ |
| GET | `/api/usuarios` | Listar usuarios (admin) | ✅ |

**Ejemplo de Login:**
```bash
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"123456"}'
```

### Atletas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/atletas` | Listar todos los atletas |
| GET | `/api/atletas/:id` | Obtener atleta específico |
| POST | `/api/atletas` | Crear nuevo atleta |
| PUT | `/api/atletas/:id` | Actualizar atleta |
| DELETE | `/api/atletas/:id` | Eliminar atleta |

### Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categorias` | Listar categorías |
| POST | `/api/categorias` | Crear categoría |
| PUT | `/api/categorias/:id` | Actualizar categoría |
| DELETE | `/api/categorias/:id` | Eliminar categoría |

### Asistencias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/asistencias` | Listar asistencias |
| GET | `/api/asistencias/atleta/:id` | Asistencias por atleta |
| POST | `/api/asistencias` | Registrar asistencia |

### Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pagos` | Listar pagos |
| GET | `/api/pagos/atleta/:id` | Pagos por atleta |
| POST | `/api/pagos` | Registrar pago |
| PUT | `/api/pagos/:id` | Actualizar pago |

### Plantel

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/plantel` | Listar plantel |
| POST | `/api/plantel` | Agregar miembro |
| PUT | `/api/plantel/:id` | Actualizar miembro |
| DELETE | `/api/plantel/:id` | Eliminar miembro |

### Tutores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tutores` | Listar tutores |
| GET | `/api/tutores/:id` | Obtener tutor |
| POST | `/api/tutores` | Crear tutor |
| PUT | `/api/tutores/:id` | Actualizar tutor |
| DELETE | `/api/tutores/:id` | Eliminar tutor |

## 🔐 Autenticación

Todas las rutas (excepto login) requieren autenticación mediante JWT. El frontend debe enviar el token en el header:

```
X-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👤 Usuario de Prueba

La base de datos incluye un usuario de prueba:

- **Email:** test@gmail.com
- **Contraseña:** 123456
- **Rol:** ADMIN

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
cd server
npm install
```

### Error: "Access denied for user"
- Verifica las credenciales en el archivo `.env`
- Asegúrate de que MySQL esté corriendo (en XAMPP)

### Error: "ER_BAD_DB_ERROR"
- La base de datos no existe. Créala e importa el archivo SQL

### Puerto 3000 ya está en uso
Cambia el puerto en `.env`:
```env
PORT=3001
```

## 📁 Estructura del Proyecto

```
server/
├── config/
│   └── database.js      # Configuración de MySQL
├── routes/              # Rutas de la API
│   ├── usuarios.js
│   ├── atletas.js
│   ├── categorias.js
│   ├── asistencias.js
│   ├── pagos.js
│   ├── plantel.js
│   └── tutores.js
├── middleware/
│   └── auth.js          # Autenticación JWT
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de .env
├── index.js             # Servidor principal
└── package.json         # Dependencias
```
