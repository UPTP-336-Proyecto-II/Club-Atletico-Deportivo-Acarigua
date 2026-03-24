const express = require('express');
const router = express.Router();
const historialPartidosController = require('../controllers/historialPartidosController');
const { verifyToken } = require('../middleware/auth');

// Endpoint para traer los partidos jugados por una categoria especifica
router.get('/categoria/:id', verifyToken, historialPartidosController.getHistorialByCategoria);

module.exports = router;
