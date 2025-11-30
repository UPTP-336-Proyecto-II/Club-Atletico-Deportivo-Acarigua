const express = require('express');
const router = express.Router();
const { 
  getLogin, 
  getLoginById, 
  createLogin, 
  updateLogin, 
  deleteLogin 
} = require('../controllers/loginController');

router.get('/', getLogin);
router.get('/:id', getLoginById);
router.post('/', createLogin);
router.put('/:id', updateLogin);
router.delete('/:id', deleteLogin);

module.exports = router;