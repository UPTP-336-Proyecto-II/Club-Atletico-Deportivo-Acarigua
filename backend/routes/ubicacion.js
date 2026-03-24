const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/ubicacionController');
const { verifyToken } = require('../middleware/auth');

router.get('/estados', verifyToken, ubicacionController.getEstados);
router.get('/estados/:estado_id/municipios', verifyToken, ubicacionController.getMunicipiosByEstado);
router.get('/municipios/:municipio_id/parroquias', verifyToken, ubicacionController.getParroquiasByMunicipio);

module.exports = router;
