const express = require('express');
const router = express.Router();
const { 
  getAsistencias, 
  createAsistencia, 
  getAsistenciasByFecha, 
  updateAsistencia 
} = require('../controllers/asistenciasController');

router.get('/', getAsistencias);
router.get('/fecha/:fecha', getAsistenciasByFecha);
router.post('/', createAsistencia);
router.put('/:id', updateAsistencia);

module.exports = router;