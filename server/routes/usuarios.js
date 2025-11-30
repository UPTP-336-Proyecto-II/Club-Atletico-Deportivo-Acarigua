const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// LOGIN - Autenticación de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                code: 60001,
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario por email
        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE EMAIL = ? AND ESTATUS = "ACTIVO"',
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                code: 60002,
                message: 'Credenciales incorrectas'
            });
        }

        const usuario = usuarios[0];

        // Verificar contraseña (por ahora sin hash, pero debería estar hasheada)
        // TODO: Implementar bcrypt.compare cuando las contraseñas estén hasheadas
        if (password !== usuario.PASSWORD) {
            return res.status(401).json({
                code: 60002,
                message: 'Credenciales incorrectas'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: usuario.USUARIO_ID,
                email: usuario.EMAIL,
                rol: usuario.ROL
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Actualizar token en la base de datos
        await db.query(
            'UPDATE usuarios SET TOKEN = ?, ULTIMO_ACCESO = NOW() WHERE USUARIO_ID = ?',
            [token, usuario.USUARIO_ID]
        );

        res.json({
            code: 20000,
            data: {
                token,
                user: {
                    id: usuario.USUARIO_ID,
                    email: usuario.EMAIL,
                    rol: usuario.ROL,
                    estatus: usuario.ESTATUS
                }
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al iniciar sesión'
        });
    }
});

// OBTENER INFO DEL USUARIO (requiere autenticación)
router.get('/info', verificarToken, async (req, res) => {
    try {
        const [usuarios] = await db.query(
            'SELECT USUARIO_ID, EMAIL, ROL, ESTATUS FROM usuarios WHERE USUARIO_ID = ?',
            [req.usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                code: 60003,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            code: 20000,
            data: {
                id: usuarios[0].USUARIO_ID,
                email: usuarios[0].EMAIL,
                rol: usuarios[0].ROL,
                estatus: usuarios[0].ESTATUS,
                roles: [usuarios[0].ROL], // Para compatibilidad con frontend
                name: usuarios[0].EMAIL.split('@')[0], // Nombre temporal
                avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
            }
        });
    } catch (error) {
        console.error('Error al obtener info:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al obtener información del usuario'
        });
    }
});

// LOGOUT
router.post('/logout', verificarToken, async (req, res) => {
    try {
        // Opcional: limpiar token de la BD
        await db.query(
            'UPDATE usuarios SET TOKEN = NULL WHERE USUARIO_ID = ?',
            [req.usuario.id]
        );

        res.json({
            code: 20000,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al cerrar sesión'
        });
    }
});

// REGISTRAR NUEVO USUARIO (solo admin)
router.post('/registro', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { email, password, rol } = req.body;

        if (!email || !password || !rol) {
            return res.status(400).json({
                code: 60004,
                message: 'Todos los campos son requeridos'
            });
        }

        // Verificar si el email ya existe
        const [existente] = await db.query(
            'SELECT USUARIO_ID FROM usuarios WHERE EMAIL = ?',
            [email]
        );

        if (existente.length > 0) {
            return res.status(400).json({
                code: 60005,
                message: 'El email ya está registrado'
            });
        }

        // Insertar nuevo usuario (por ahora sin hash de contraseña)
        // TODO: Hashear contraseña con bcrypt
        const [resultado] = await db.query(
            'INSERT INTO usuarios (EMAIL, PASSWORD, ROL, ESTATUS) VALUES (?, ?, ?, "ACTIVO")',
            [email, password, rol]
        );

        res.json({
            code: 20000,
            data: {
                id: resultado.insertId,
                email,
                rol,
                message: 'Usuario registrado exitosamente'
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al registrar usuario'
        });
    }
});

// LISTAR USUARIOS (solo admin)
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const [usuarios] = await db.query(
            'SELECT USUARIO_ID, EMAIL, ROL, ESTATUS, CREATED_AT, ULTIMO_ACCESO FROM usuarios ORDER BY CREATED_AT DESC'
        );

        res.json({
            code: 20000,
            data: usuarios
        });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al obtener usuarios'
        });
    }
});

module.exports = router;
