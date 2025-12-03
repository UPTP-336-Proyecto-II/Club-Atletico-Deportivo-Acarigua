const express = require('express');
const router = express.Router();
const graficaRendimientoController = require('../controllers/graficaRendimientoController');

// Rutas para gráficas de rendimiento
router.get('/', graficaRendimientoController.getGraficas);
router.get('/atleta/:atleta_id', graficaRendimientoController.getGraficaByAtleta);
router.get('/datos/:atleta_id', graficaRendimientoController.getDatosGrafica);
router.post('/', graficaRendimientoController.createGrafica);

module.exports = router;
