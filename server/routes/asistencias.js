const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// LISTAR ASISTENCIAS
router.get('/', verificarToken, async (req, res) => {
    try {
        const [asistencias] = await db.query(`
      SELECT 
        ca.*,
        CONCAT(a.NOMBRE, ' ', a.APELLIDO) as NOMBRE_ATLETA,
        CONCAT(p.NOMBRE, ' ', p.APELLIDO) as NOMBRE_ENTRENADOR
      FROM control_asistencias ca
      LEFT JOIN atletas a ON ca.ATLETICA_ID = a.ATLETA_ID
      LEFT JOIN plantel p ON ca.ENTRENADOR_ID = p.PLANTEL_ID
      ORDER BY ca.FECHA DESC
    `);

        res.json({ code: 20000, data: asistencias });
    } catch (error) {
        console.error('Error al listar asistencias:', error);
        res.status(500).json({ code: 50000, message: 'Error al obtener asistencias' });
    }
});

// REGISTRAR ASISTENCIA
router.post('/', verificarToken, async (req, res) => {
    try {
        const { ATLETICA_ID, FECHA, TIPO_EVENTO, ESTATUS, ENTRENADOR_ID, OBSERVACIONES } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO control_asistencias 
      (ATLETICA_ID, FECHA, TIPO_EVENTO, ESTATUS, ENTRENADOR_ID, OBSERVACIONES) 
      VALUES (?, ?, ?, ?, ?, ?)`,
            [ATLETICA_ID, FECHA, TIPO_EVENTO, ESTATUS, ENTRENADOR_ID, OBSERVACIONES]
        );

        res.json({ code: 20000, data: { id: resultado.insertId, message: 'Asistencia registrada' } });
    } catch (error) {
        console.error('Error al registrar asistencia:', error);
        res.status(500).json({ code: 50000, message: 'Error al registrar asistencia' });
    }
});

// OBTENER ASISTENCIAS POR ATLETA
router.get('/atleta/:id', verificarToken, async (req, res) => {
    try {
        const [asistencias] = await db.query(
            'SELECT * FROM control_asistencias WHERE ATLETICA_ID = ? ORDER BY FECHA DESC',
            [req.params.id]
        );

        res.json({ code: 20000, data: asistencias });
    } catch (error) {
        console.error('Error al obtener asistencias:', error);
        res.status(500).json({ code: 50000, message: 'Error al obtener asistencias' });
    }
});

module.exports = router;
