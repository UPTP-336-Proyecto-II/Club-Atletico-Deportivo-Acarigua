const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// LISTAR PAGOS
router.get('/', verificarToken, async (req, res) => {
    try {
        const [pagos] = await db.query(`
      SELECT 
        p.*,
        CONCAT(a.NOMBRE, ' ', a.APELLIDO) as NOMBRE_ATLETA
      FROM pagos p
      LEFT JOIN atletas a ON p.ATLETA_ID = a.ATLETA_ID
      ORDER BY p.CREATED_AT DESC
    `);

        res.json({ code: 20000, data: pagos });
    } catch (error) {
        console.error('Error al listar pagos:', error);
        res.status(500).json({ code: 50000, message: 'Error al obtener pagos' });
    }
});

// REGISTRAR PAGO
router.post('/', verificarToken, async (req, res) => {
    try {
        const { ATLETA_ID, MES_CORRESPONDIENTE, MONTO, FECHA_PAGO, REF_PAGO, ESTATUS } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO pagos 
      (ATLETA_ID, MES_CORRESPONDIENTE, MONTO, FECHA_PAGO, REF_PAGO, ESTATUS) 
      VALUES (?, ?, ?, ?, ?, ?)`,
            [ATLETA_ID, MES_CORRESPONDIENTE, MONTO, FECHA_PAGO, REF_PAGO, ESTATUS || 'PENDIENTE']
        );

        res.json({ code: 20000, data: { id: resultado.insertId, message: 'Pago registrado' } });
    } catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({ code: 50000, message: 'Error al registrar pago' });
    }
});

// ACTUALIZAR PAGO
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { ESTATUS, FECHA_PAGO, REF_PAGO } = req.body;

        await db.query(
            'UPDATE pagos SET ESTATUS = ?, FECHA_PAGO = ?, REF_PAGO = ? WHERE PAGO_ID = ?',
            [ESTATUS, FECHA_PAGO, REF_PAGO, req.params.id]
        );

        res.json({ code: 20000, message: 'Pago actualizado' });
    } catch (error) {
        console.error('Error al actualizar pago:', error);
        res.status(500).json({ code: 50000, message: 'Error al actualizar pago' });
    }
});

// OBTENER PAGOS POR ATLETA
router.get('/atleta/:id', verificarToken, async (req, res) => {
    try {
        const [pagos] = await db.query(
            'SELECT * FROM pagos WHERE ATLETA_ID = ? ORDER BY CREATED_AT DESC',
            [req.params.id]
        );

        res.json({ code: 20000, data: pagos });
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        res.status(500).json({ code: 50000, message: 'Error al obtener pagos' });
    }
});

module.exports = router;
