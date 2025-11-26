const express = require('express');
const router = express.Router();
const { 
  getAtletas, 
  getAtletaById, 
  createAtleta, 
  updateAtleta, 
  deleteAtleta 
} = require('../controllers/atletasController');

router.get('/', getAtletas);
router.get('/:id', getAtletaById);
router.post('/', createAtleta);
router.put('/:id', updateAtleta);
router.delete('/:id', deleteAtleta);

module.exports = router;