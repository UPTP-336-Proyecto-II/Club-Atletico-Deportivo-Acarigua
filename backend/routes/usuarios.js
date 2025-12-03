const express = require('express');
const router = express.Router();
const { getUsuarios, login, getInfo, logout, createUsuario } = require('../controllers/usuariosController');
const { verifyToken } = require('../middleware/auth');

router.get('/', getUsuarios);
router.post('/login', login);
router.get('/info', verifyToken, getInfo);
router.post('/logout', verifyToken, logout);
router.post('/', createUsuario);

module.exports = router;