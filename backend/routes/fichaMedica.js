const express = require('express');
const router = express.Router();
const fichaMedicaController = require('../controllers/fichaMedicaController');

// Rutas para fichas médicas
router.get('/', fichaMedicaController.getFichasMedicas);
router.get('/atleta/:atleta_id', fichaMedicaController.getFichaMedicaByAtleta);
router.post('/', fichaMedicaController.createFichaMedica);
router.put('/:id', fichaMedicaController.updateFichaMedica);

module.exports = router;
