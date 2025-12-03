const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:9527', // O el puerto de tu Vue.js
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Importar rutas existentes
const usuariosRoutes = require('./routes/usuarios');
const atletasRoutes = require('./routes/atletas');
const asistenciasRoutes = require('./routes/asistencias');
const medicionesRoutes = require('./routes/mediciones');
const testsRoutes = require('./routes/tests');

// Importar nuevas rutas
const categoriaRoutes = require('./routes/categoria');
const fichaMedicaRoutes = require('./routes/fichaMedica');
const graficaRendimientoRoutes = require('./routes/graficaRendimiento');
const implementosRoutes = require('./routes/implementos');
const pagosRoutes = require('./routes/pagos');
const plantelRoutes = require('./routes/plantel');
const tutorRoutes = require('./routes/tutor');

// Usar rutas existentes
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/atletas', atletasRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/mediciones', medicionesRoutes);
app.use('/api/tests', testsRoutes);

// Usar nuevas rutas
app.use('/api/categoria', categoriaRoutes);
app.use('/api/ficha-medica', fichaMedicaRoutes);
app.use('/api/grafica-rendimiento', graficaRendimientoRoutes);
app.use('/api/implementos', implementosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/plantel', plantelRoutes);
app.use('/api/tutor', tutorRoutes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({
    message: '🏆 API Club Atlético Deportivo Acarigua - Sistema de Gestión Deportiva',
    version: '2.0.0',
    database: 'club_atletico_acarigua',
    endpoints: {
      usuarios: '/api/usuarios',
      atletas: '/api/atletas',
      asistencias: '/api/asistencias',
      mediciones: '/api/mediciones',
      tests: '/api/tests',
      categoria: '/api/categoria',
      fichaMedica: '/api/ficha-medica',
      graficaRendimiento: '/api/grafica-rendimiento',
      implementos: '/api/implementos',
      pagos: '/api/pagos',
      plantel: '/api/plantel',
      tutor: '/api/tutor'
    }
  });
});

// Manejo de errores 404
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
  console.log(`📊 Base de datos: club_atletico_acarigua`);
  console.log(`📍 Ruta principal: http://localhost:${PORT}/api`);
  console.log('✅ Servidor iniciado correctamente');
  console.log('\n📋 Endpoints disponibles:');
  console.log('   - Usuarios: /api/usuarios');
  console.log('   - Atletas: /api/atletas');
  console.log('   - Asistencias: /api/asistencias');
  console.log('   - Mediciones: /api/mediciones');
  console.log('   - Tests: /api/tests');
  console.log('   - Categorías: /api/categoria');
  console.log('   - Fichas Médicas: /api/ficha-medica');
  console.log('   - Gráficas de Rendimiento: /api/grafica-rendimiento');
  console.log('   - Implementos: /api/implementos');
  console.log('   - Pagos: /api/pagos');
  console.log('   - Plantel: /api/plantel');
  console.log('   - Tutores: /api/tutor');
});