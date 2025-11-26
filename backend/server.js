const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const atletasRoutes = require('./routes/atletas');
const asistenciasRoutes = require('./routes/asistencias');
const medicionesRoutes = require('./routes/mediciones');
const testsRoutes = require('./routes/tests');

// Usar rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/atletas', atletasRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/mediciones', medicionesRoutes);
app.use('/api/tests', testsRoutes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    message: '🏆 API Club Deportivo Acarigua - Sistema de Gestión Deportiva',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      atletas: '/api/atletas',
      asistencias: '/api/asistencias',
      mediciones: '/api/mediciones',
      tests: '/api/tests'
    }
  });
});

// SOLUCIÓN: Manejo de errores 404 sin usar '*'
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    message: `La ruta ${req.method} ${req.path} no existe`
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error del servidor:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor API corriendo en: http://localhost:${PORT}`);
  console.log(`📊 Base de datos: club_deportivo_acarigua`);
  console.log(`📍 Ruta principal: http://localhost:${PORT}/api`);
  console.log('✅ Servidor iniciado correctamente');
});