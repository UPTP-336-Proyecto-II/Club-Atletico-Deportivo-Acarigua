const express = require('express');
const router = express.Router();
const plantelController = require('../controllers/plantelController');

// Rutas para plantel
router.get('/', plantelController.getPlantel);
router.get('/rol/:rol', plantelController.getPlantelByRol);
router.get('/:id', plantelController.getPlantelById);
router.post('/', plantelController.createMiembroPlantel);
router.put('/:id', plantelController.updateMiembroPlantel);
router.delete('/:id', plantelController.deleteMiembroPlantel);

module.exports = router;
