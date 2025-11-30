# 🏆 Guía de Instalación de la Base de Datos

Esta guía te ayudará a configurar MySQL y la base de datos para el sistema del Club Atlético Deportivo Acarigua.

## Opción 1: Instalar XAMPP (Recomendado para Windows) ⭐

XAMPP incluye MySQL, phpMyAdmin y Apache en un solo paquete fácil de instalar.

### Pasos:

1. **Descargar XAMPP**
   - Ve a: https://www.apachefriends.org/es/download.html
   - Descarga la versión para Windows
   - Ejecuta el instalador descargado

2. **Instalar XAMPP**
   - Sigue el asistente de instalación
   - Selecciona al menos: Apache, MySQL y phpMyAdmin
   - Instala en la ubicación por defecto: `C:\xampp`

3. **Iniciar XAMPP**
   - Abre el "Panel de Control de XAMPP"
   - Haz clic en **Start** en las líneas de:
     - ✅ Apache
     - ✅ MySQL
   - Ambos deberían aparecer en verde

4. **Crear la Base de Datos**
   - Abre tu navegador
   - Ve a: http://localhost/phpmyadmin
   - Haz clic en "Nueva" en el panel izquierdo
   - Nombre de la base de datos: `club_atletico_acarigua`
   - Cotejamiento: `utf8mb4_unicode_ci`
   - Haz clic en "Crear"

5. **Importar el archivo SQL**
   - Con la base de datos seleccionada, ve a la pestaña "Importar"
   - Haz clic en "Seleccionar archivo"
   - Busca y selecciona: `database/club_atletico_acarigua.sql`
   - Desplázate hacia abajo y haz clic en "Continuar"
   - ✅ Deberías ver un mensaje de éxito

6. **Verificar**
   - En el panel izquierdo deberías ver la base de datos con varias tablas:
     - atletas
     - usuarios
     - categoria
     - control_asistencias
     - pagos
     - plantel
     - tutor
     - y más...

✅ **¡Listo!** Tu base de datos está configurada.

## Opción 2: MySQL Independiente

Si ya tienes MySQL instalado o prefieres instalarlo por separado:

### Instalar MySQL

1. Descarga MySQL desde: https://dev.mysql.com/downloads/installer/
2. Ejecuta el instalador
3. Selecciona "Custom" o "Developer Default"
4. Configura una contraseña para el usuario `root` (o déjala vacía)
5. Anota la contraseña que uses

### Crear la base de datos

```bash
# Abre PowerShell o CMD
mysql -u root -p

# Ejecuta estos comandos en MySQL:
CREATE DATABASE club_atletico_acarigua CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE club_atletico_acarigua;
SOURCE C:/Users/Alejandro/Documents/Club-Atletico-Deportivo-Acarigua/database/club_atletico_acarigua.sql;
EXIT;
```

### Actualizar credenciales

Si configuraste una contraseña para MySQL, actualiza el archivo `server/.env`:

```env
DB_PASSWORD=tu_contraseña_aqui
```

## 🔍 Verificar la Instalación

### Desde phpMyAdmin (XAMPP)
- Ve a http://localhost/phpmyadmin
- Selecciona `club_atletico_acarigua`
- Verás todas las tablas listadas

### Desde línea de comandos
```bash
mysql -u root -p
USE club_atletico_acarigua;
SHOW TABLES;
SELECT * FROM usuarios;
```

Deberías ver al menos 3 usuarios de prueba.

## ❗ Solución de Problemas

### XAMPP no inicia MySQL

**Problema:** Puerto 3306 ocupado

**Solución:**
1. Abre el Panel de XAMPP
2. Haz clic en "Config" de MySQL
3. Selecciona "my.ini"
4. Busca la línea `port=3306`
5. Cámbiala a `port=3307`
6. Guarda y reinicia MySQL
7. Actualiza `server/.env`: `DB_PORT=3307`

### No puedo acceder a phpMyAdmin

**Solución:**
- Asegúrate de que Apache esté corriendo en XAMPP
- Verifica que ambos (Apache y MySQL) estén en verde
- Intenta: http://127.0.0.1/phpmyadmin

### Error al importar SQL

**Problema:** "MySQL server has gone away"

**Solución:**
- El archivo es muy grande. En phpMyAdmin:
  - Ve a config.inc.php
  - O divide el archivo SQL en partes más pequeñas

## ✅ Próximos Pasos

Una vez que la base de datos esté configurada:

1. Instala las dependencias del backend:
   ```bash
   cd server
   npm install
   ```

2. Inicia el servidor:
   ```bash
   npm start
   ```

3. Inicia el frontend (en otra terminal):
   ```bash
   npm run dev
   ```

4. Accede a http://localhost:9528 y prueba el login con:
   - Email: `test@gmail.com`
   - Contraseña: `123456`
