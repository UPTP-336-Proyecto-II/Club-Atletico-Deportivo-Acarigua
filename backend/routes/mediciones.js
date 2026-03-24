const express = require('express');
const router = express.Router();
const { 
  getMediciones, 
  getMedicionesByAtleta, 
  createMedicion, 
  getUltimaMedicion,
  getEvolucionPeso,
  deleteMedicion,
  updateMedicion
} = require('../controllers/medicionesController');

router.get('/', getMediciones);
router.get('/atleta/:atleta_id', getMedicionesByAtleta);
router.get('/atleta/:atleta_id/ultima', getUltimaMedicion);
router.get('/atleta/:atleta_id/evolucion-peso', getEvolucionPeso);
router.post('/', createMedicion);
router.put('/:id', updateMedicion);
router.delete('/:id', deleteMedicion);

module.exports = router;