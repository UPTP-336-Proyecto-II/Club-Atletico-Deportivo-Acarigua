const express = require('express');
const router = express.Router();
const carnetDiscapacidadController = require('../controllers/carnetDiscapacidadController');
const { verifyToken } = require('../middleware/auth');

router.get('/tipos', verifyToken, carnetDiscapacidadController.getTiposDiscapacidad);
router.get('/atleta/:id', verifyToken, carnetDiscapacidadController.getCarnetByAtleta);
router.post('/', verifyToken, carnetDiscapacidadController.createCarnet);
router.put('/:id', verifyToken, carnetDiscapacidadController.updateCarnet);
router.delete('/:id', verifyToken, carnetDiscapacidadController.deleteCarnet);

module.exports = router;
