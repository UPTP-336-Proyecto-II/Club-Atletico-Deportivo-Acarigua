# 🚀 Inicio Rápido - Club Atlético Deportivo Acarigua

## Paso 1: Instalar y Configurar MySQL ⚙️

**¿Ya tienes XAMPP o MySQL instalado?**
- ✅ **SÍ** → Pasa al Paso 2
- ❌ **NO** → Lee `GUIA_BASE_DE_DATOS.md` (instrucciones detalladas)

**Resumen rápido con XAMPP:**
1. Descarga XAMPP: https://www.apachefriends.org/es/download.html
2. Instálalo y abre el Panel de Control
3. Inicia **Apache** y **MySQL** (botones Start)
4. Ve a http://localhost/phpmyadmin
5. Crea base de datos: `club_atletico_acarigua`
6. Importa el archivo: `database/club_atletico_acarigua.sql`

## Paso 2: Iniciar el Backend 🖥️

```bash
# Desde la carpeta raíz del proyecto
cd server

# Iniciar el servidor (ya tiene las dependencias instaladas)
node index.js
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
📊 Base de datos: club_atletico_acarigua
✅ Conexión exitosa a la base de datos MySQL
```

## Paso 3: Iniciar el Frontend 💻

Abre **otra terminal** (el backend debe seguir corriendo):

```bash
# Desde la carpeta raíz del proyecto

# Instalar dependencias (si no las tienes)
npm install

# Iniciar el frontend
npm run dev
```

El frontend se abrirá en: http://localhost:9528

## Paso 4: Probar el Sistema ✅

1. **Accede** a http://localhost:9528
2. **Inicia sesión** con:
   - **Email:** `test@gmail.com`
   - **Contraseña:** `123456`
3. **¡Listo!** Ya puedes usar el sistema

## 📝 Resumen de Comandos

```bash
# Terminal 1: Backend
cd server
node index.js

# Terminal 2: Frontend (en otra ventana)
npm run dev
```

## 🔧 Si algo no funciona

### Backend no inicia
- ❌ **Error:** "Error al conectar con la base de datos"
  - ✅ Verifica que MySQL esté corriendo en XAMPP
  - ✅ Verifica que la base de datos `club_atletico_acarigua` exista

### Frontend no conecta con Backend
- ❌ **Error:** "Network Error" o similar
  - ✅ Asegúrate de que el backend esté corriendo en http://localhost:3000
  - ✅ Prueba abrir http://localhost:3000/health en tu navegador

### No puedo hacer login
- ✅ Verifica que importaste el archivo SQL completo
- ✅ Prueba con el usuario: `test@gmail.com` / `123456`

## 📚 Más Información

- **Documentación del Backend:** `server/README.md`
- **Guía de Base de Datos:** `GUIA_BASE_DE_DATOS.md`
- **Endpoints disponibles:** Ver `server/README.md`

## 📞 Estructura de la API

El backend expone estas rutas principales:

- `/api/usuarios` - Gestión de usuarios y autenticación
- `/api/atletas` - CRUD de atletas
- `/api/categorias` - Gestión de categorías
- `/api/asistencias` - Control de asistencias
- `/api/pagos` - Gestión de pagos
- `/api/plantel` - Gestión del plantel
- `/api/tutores` - Gestión de tutores

Todos los endpoints requieren autenticación JWT excepto `/api/usuarios/login`.
