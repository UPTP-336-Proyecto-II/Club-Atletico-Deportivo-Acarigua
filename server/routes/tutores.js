const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// LISTAR TUTORES
router.get('/', verificarToken, async (req, res) => {
    try {
        const [tutores] = await db.query('SELECT * FROM tutor ORDER BY NOMBRE_COMPLETO');
        res.json({ code: 20000, data: tutores });
    } catch (error) {
        console.error('Error al listar tutores:', error);
        res.status(500).json({ code: 50000, message: 'Error al obtener tutores' });
    }
});

// OBTENER TUTOR POR ID
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const [tutores] = await db.query('SELECT * FROM tutor WHERE TUTOR_ID = ?', [req.params.id]);

        if (tutores.length === 0) {
            return res.status(404).json({ code: 60404, message: 'Tutor no encontrado' });
        }

        res.json({ code: 20000, data: tutores[0] });
    } catch (error) {
        console.error('Error al obtener tutor:', error);
        res.status(500).json({ code: 50000, message: 'Error al obtener tutor' });
    }
});

// CREAR TUTOR
router.post('/', verificarToken, async (req, res) => {
    try {
        const { NOMBRE_COMPLETO, TELEFONO, CORREO, DIRECCION, TIPO_RELACION } = req.body;

        const [resultado] = await db.query(
            'INSERT INTO tutor (NOMBRE_COMPLETO, TELEFONO, CORREO, DIRECCION, TIPO_RELACION) VALUES (?, ?, ?, ?, ?)',
            [NOMBRE_COMPLETO, TELEFONO, CORREO, DIRECCION, TIPO_RELACION]
        );

        res.json({ code: 20000, data: { id: resultado.insertId, message: 'Tutor creado' } });
    } catch (error) {
        console.error('Error al crear tutor:', error);
        res.status(500).json({ code: 50000, message: 'Error al crear tutor' });
    }
});

// ACTUALIZAR TUTOR
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { NOMBRE_COMPLETO, TELEFONO, CORREO, DIRECCION, TIPO_RELACION } = req.body;

        await db.query(
            'UPDATE tutor SET NOMBRE_COMPLETO = ?, TELEFONO = ?, CORREO = ?, DIRECCION = ?, TIPO_RELACION = ? WHERE TUTOR_ID = ?',
            [NOMBRE_COMPLETO, TELEFONO, CORREO, DIRECCION, TIPO_RELACION, req.params.id]
        );

        res.json({ code: 20000, message: 'Tutor actualizado' });
    } catch (error) {
        console.error('Error al actualizar tutor:', error);
        res.status(500).json({ code: 50000, message: 'Error al actualizar tutor' });
    }
});

// ELIMINAR TUTOR
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        await db.query('DELETE FROM tutor WHERE TUTOR_ID = ?', [req.params.id]);
        res.json({ code: 20000, message: 'Tutor eliminado' });
    } catch (error) {
        console.error('Error al eliminar tutor:', error);
        res.status(500).json({ code: 50000, message: 'Error al eliminar tutor' });
    }
});

module.exports = router;
