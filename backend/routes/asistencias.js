const express = require('express');
const router = express.Router();
const {
  getAsistencias,
  createAsistencia,
  getAsistenciasByFecha,
  updateAsistencia,
  deleteAsistencia
} = require('../controllers/asistenciasController');

router.get('/', getAsistencias);
router.get('/fecha/:fecha', getAsistenciasByFecha);
router.post('/', createAsistencia);
router.put('/:id', updateAsistencia);
router.delete('/:id', deleteAsistencia);

module.exports = router;