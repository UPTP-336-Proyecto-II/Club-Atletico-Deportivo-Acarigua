const express = require('express');
const router = express.Router();
const implementosController = require('../controllers/implementosController');

// Rutas para implementos deportivos
router.get('/', implementosController.getImplementos);
router.get('/:id', implementosController.getImplementoById);
router.post('/', implementosController.createImplemento);
router.put('/:id', implementosController.updateImplemento);
router.patch('/:id/estatus', implementosController.updateEstatus);
router.delete('/:id', implementosController.deleteImplemento);

module.exports = router;
