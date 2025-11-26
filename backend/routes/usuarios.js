const express = require('express');
const router = express.Router();
const { getUsuarios, login, createUsuario } = require('../controllers/usuariosController');

router.get('/', getUsuarios);
router.post('/login', login);
router.post('/', createUsuario);

module.exports = router;