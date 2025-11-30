const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// LISTAR CATEGORÍAS
router.get('/', verificarToken, async (req, res) => {
    try {
        const [categorias] = await db.query('SELECT * FROM categoria ORDER BY EDAD_MIN');
        res.json({ code: 20000, data: categorias });
    } catch (error) {
        console.error('Error al listar categorías:', error);
        res.status(500).json({ code: 50000, message: 'Error al obtener categorías' });
    }
});

// CREAR CATEGORÍA
router.post('/', verificarToken, async (req, res) => {
    try {
        const { NOMBRE_CATEGORIA, EDAD_MIN, EDAD_MAX, ENTRENADOR_ID } = req.body;

        const [resultado] = await db.query(
            'INSERT INTO categoria (NOMBRE_CATEGORIA, EDAD_MIN, EDAD_MAX, ENTRENADOR_ID) VALUES (?, ?, ?, ?)',
            [NOMBRE_CATEGORIA, EDAD_MIN, EDAD_MAX, ENTRENADOR_ID]
        );

        res.json({ code: 20000, data: { id: resultado.insertId, message: 'Categoría creada' } });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ code: 50000, message: 'Error al crear categoría' });
    }
});

// ACTUALIZAR CATEGORÍA
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { NOMBRE_CATEGORIA, EDAD_MIN, EDAD_MAX, ENTRENADOR_ID } = req.body;

        await db.query(
            'UPDATE categoria SET NOMBRE_CATEGORIA = ?, EDAD_MIN = ?, EDAD_MAX = ?, ENTRENADOR_ID = ? WHERE CATEGORIA_ID = ?',
            [NOMBRE_CATEGORIA, EDAD_MIN, EDAD_MAX, ENTRENADOR_ID, req.params.id]
        );

        res.json({ code: 20000, message: 'Categoría actualizada' });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ code: 50000, message: 'Error al actualizar categoría' });
    }
});

// ELIMINAR CATEGORÍA
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        await db.query('DELETE FROM categoria WHERE CATEGORIA_ID = ?', [req.params.id]);
        res.json({ code: 20000, message: 'Categoría eliminada' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ code: 50000, message: 'Error al eliminar categoría' });
    }
});

module.exports = router;
