const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// LISTAR ATLETAS
router.get('/', verificarToken, async (req, res) => {
    try {
        const [atletas] = await db.query(`
      SELECT 
        a.*,
        c.NOMBRE_CATEGORIA,
        t.NOMBRE_COMPLETO as NOMBRE_TUTOR
      FROM atletas a
      LEFT JOIN categoria c ON a.CATEGORIA_ID = c.CATEGORIA_ID
      LEFT JOIN tutor t ON a.TUTOR_ID = t.TUTOR_ID
      ORDER BY a.CREATED_AT DESC
    `);

        res.json({
            code: 20000,
            data: atletas
        });
    } catch (error) {
        console.error('Error al listar atletas:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al obtener atletas'
        });
    }
});

// OBTENER ATLETA POR ID
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const [atletas] = await db.query(`
      SELECT 
        a.*,
        c.NOMBRE_CATEGORIA,
        t.NOMBRE_COMPLETO as NOMBRE_TUTOR,
        t.TELEFONO as TELEFONO_TUTOR
      FROM atletas a
      LEFT JOIN categoria c ON a.CATEGORIA_ID = c.CATEGORIA_ID
      LEFT JOIN tutor t ON a.TUTOR_ID = t.TUTOR_ID
      WHERE a.ATLETA_ID = ?
    `, [req.params.id]);

        if (atletas.length === 0) {
            return res.status(404).json({
                code: 60404,
                message: 'Atleta no encontrado'
            });
        }

        res.json({
            code: 20000,
            data: atletas[0]
        });
    } catch (error) {
        console.error('Error al obtener atleta:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al obtener atleta'
        });
    }
});

// CREAR ATLETA
router.post('/', verificarToken, async (req, res) => {
    try {
        const {
            NOMBRE,
            APELLIDO,
            TELEFONO,
            DIRECCION,
            FECHA_NACIMIENTO,
            POSICION_DE_JUEGO,
            CATEGORIA_ID,
            TUTOR_ID,
            ESTATUS
        } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO atletas 
      (NOMBRE, APELLIDO, TELEFONO, DIRECCION, FECHA_NACIMIENTO, POSICION_DE_JUEGO, CATEGORIA_ID, TUTOR_ID, ESTATUS) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [NOMBRE, APELLIDO, TELEFONO, DIRECCION, FECHA_NACIMIENTO, POSICION_DE_JUEGO, CATEGORIA_ID, TUTOR_ID, ESTATUS || 'ACTIVO']
        );

        res.json({
            code: 20000,
            data: {
                id: resultado.insertId,
                message: 'Atleta creado exitosamente'
            }
        });
    } catch (error) {
        console.error('Error al crear atleta:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al crear atleta'
        });
    }
});

// ACTUALIZAR ATLETA
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const {
            NOMBRE,
            APELLIDO,
            TELEFONO,
            DIRECCION,
            FECHA_NACIMIENTO,
            POSICION_DE_JUEGO,
            CATEGORIA_ID,
            TUTOR_ID,
            ESTATUS
        } = req.body;

        await db.query(
            `UPDATE atletas SET 
      NOMBRE = ?, APELLIDO = ?, TELEFONO = ?, DIRECCION = ?, 
      FECHA_NACIMIENTO = ?, POSICION_DE_JUEGO = ?, CATEGORIA_ID = ?, 
      TUTOR_ID = ?, ESTATUS = ?
      WHERE ATLETA_ID = ?`,
            [NOMBRE, APELLIDO, TELEFONO, DIRECCION, FECHA_NACIMIENTO, POSICION_DE_JUEGO, CATEGORIA_ID, TUTOR_ID, ESTATUS, req.params.id]
        );

        res.json({
            code: 20000,
            message: 'Atleta actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar atleta:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al actualizar atleta'
        });
    }
});

// ELIMINAR ATLETA
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        await db.query('DELETE FROM atletas WHERE ATLETA_ID = ?', [req.params.id]);

        res.json({
            code: 20000,
            message: 'Atleta eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar atleta:', error);
        res.status(500).json({
            code: 50000,
            message: 'Error al eliminar atleta'
        });
    }
});

module.exports = router;
