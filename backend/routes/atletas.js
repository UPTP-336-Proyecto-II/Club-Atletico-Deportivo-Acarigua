const express = require('express');
const router = express.Router();
const atletasController = require('../controllers/atletasController');

// Rutas existentes
const { uploadAtleta } = require('../middleware/upload');

router.get('/', atletasController.getAtletas);
router.post('/upload', uploadAtleta.single('foto'), atletasController.uploadFoto);
router.get('/:id', atletasController.getAtletaById);
router.post('/', atletasController.createAtleta);
router.put('/:id', atletasController.updateAtleta);
router.get('/:id/tutor', atletasController.getAtletaTutor); // Ruta para obtener representante
router.put('/:id/tutor', atletasController.updateAtletaTutor); // Nueva ruta específica
router.delete('/:id/tutor', atletasController.removeAtletaTutor);
router.delete('/:id', atletasController.deleteAtleta);

module.exports = router;