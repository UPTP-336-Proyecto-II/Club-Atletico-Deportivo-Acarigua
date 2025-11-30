const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// LISTAR PLANTEL
router.get('/', verificarToken, async (req, res) => {
    try {
        const [plantel] = await db.query('SELECT * FROM plantel ORDER BY ROL, APELLIDO');
        res.json({ code: 20000, data: plantel });
    } catch (error) {
        console.error('Error al listar plantel:', error);
        res.status(500).json({ code: 50000, message: 'Error al obtener plantel' });
    }
});

// CREAR MIEMBRO DEL PLANTEL
router.post('/', verificarToken, async (req, res) => {
    try {
        const { NOMBRE, APELLIDO, TELEFONO, ROL } = req.body;

        const [resultado] = await db.query(
            'INSERT INTO plantel (NOMBRE, APELLIDO, TELEFONO, ROL) VALUES (?, ?, ?, ?)',
            [NOMBRE, APELLIDO, TELEFONO, ROL]
        );

        res.json({ code: 20000, data: { id: resultado.insertId, message: 'Miembro agregado al plantel' } });
    } catch (error) {
        console.error('Error al crear miembro del plantel:', error);
        res.status(500).json({ code: 50000, message: 'Error al agregar miembro' });
    }
});

// ACTUALIZAR MIEMBRO DEL PLANTEL
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { NOMBRE, APELLIDO, TELEFONO, ROL } = req.body;

        await db.query(
            'UPDATE plantel SET NOMBRE = ?, APELLIDO = ?, TELEFONO = ?, ROL = ? WHERE PLANTEL_ID = ?',
            [NOMBRE, APELLIDO, TELEFONO, ROL, req.params.id]
        );

        res.json({ code: 20000, message: 'Miembro actualizado' });
    } catch (error) {
        console.error('Error al actualizar miembro:', error);
        res.status(500).json({ code: 50000, message: 'Error al actualizar miembro' });
    }
});

// ELIMINAR MIEMBRO DEL PLANTEL
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        await db.query('DELETE FROM plantel WHERE PLANTEL_ID = ?', [req.params.id]);
        res.json({ code: 20000, message: 'Miembro eliminado del plantel' });
    } catch (error) {
        console.error('Error al eliminar miembro:', error);
        res.status(500).json({ code: 50000, message: 'Error al eliminar miembro' });
    }
});

module.exports = router;
