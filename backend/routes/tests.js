const express = require('express');
const router = express.Router();
const { 
  getTests, 
  getTestsByAtleta, 
  createTest, 
  getEstadisticasTests,
  getEvolucionTest
} = require('../controllers/testsController');

router.get('/', getTests);
router.get('/estadisticas', getEstadisticasTests);
router.get('/atleta/:atleta_id', getTestsByAtleta);
router.get('/atleta/:atleta_id/evolucion/:tipo_test', getEvolucionTest);
router.post('/', createTest);

module.exports = router;