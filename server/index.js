const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Importar base de datos
const db = require('./config/database');

// Middlewares
app.use(cors()); // Permitir requests desde el frontend
app.use(express.json()); // Parsear JSON en requests
app.use(express.urlencoded({ extended: true })); // Parsear form data

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const atletasRoutes = require('./routes/atletas');
const categoriasRoutes = require('./routes/categorias');
const asistenciasRoutes = require('./routes/asistencias');
const pagosRoutes = require('./routes/pagos');
const plantelRoutes = require('./routes/plantel');
const tutoresRoutes = require('./routes/tutores');

// Rutas de la API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/atletas', atletasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/plantel', plantelRoutes);
app.use('/api/tutores', tutoresRoutes);

// Ruta de prueba
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        database: 'Conectado'
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'API del Club Atlético Deportivo Acarigua',
        version: '1.0.0'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
});
