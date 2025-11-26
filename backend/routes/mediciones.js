const express = require('express');
const router = express.Router();
const { 
  getMediciones, 
  getMedicionesByAtleta, 
  createMedicion, 
  getUltimaMedicion,
  getEvolucionPeso
} = require('../controllers/medicionesController');

router.get('/', getMediciones);
router.get('/atleta/:atleta_id', getMedicionesByAtleta);
router.get('/atleta/:atleta_id/ultima', getUltimaMedicion);
router.get('/atleta/:atleta_id/evolucion-peso', getEvolucionPeso);
router.post('/', createMedicion);

module.exports = router;