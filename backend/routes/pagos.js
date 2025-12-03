const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');

// Rutas para pagos
router.get('/', pagosController.getPagos);
router.get('/atleta/:atleta_id', pagosController.getPagosByAtleta);
router.get('/pendientes', pagosController.getPagosPendientes);
router.post('/', pagosController.createPago);
router.put('/:id', pagosController.updatePago);
router.patch('/:id/pagar', pagosController.marcarComoPagado);

module.exports = router;
