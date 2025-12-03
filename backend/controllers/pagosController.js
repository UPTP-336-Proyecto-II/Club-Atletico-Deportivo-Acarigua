const pool = require('../config/database');

// Obtener todos los pagos
const getPagos = async (req, res) => {
    try {
        const { estatus, atleta_id } = req.query;

        let query = `
      SELECT p.*, 
             a.NOMBRE as atleta_nombre,
             a.APELLIDO as atleta_apellido
      FROM pagos p
      LEFT JOIN atletas a ON p.ATLETA_ID = a.ATLETA_ID
      WHERE 1=1
    `;
        const params = [];

        if (estatus) {
            query += ' AND p.ESTATUS = ?';
            params.push(estatus);
        }

        if (atleta_id) {
            query += ' AND p.ATLETA_ID = ?';
            params.push(atleta_id);
        }

        query += ' ORDER BY p.CREATED_AT DESC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo pagos:', error);
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
};

// Obtener pagos por atleta
const getPagosByAtleta = async (req, res) => {
    try {
        const { atleta_id } = req.params;

        const [rows] = await pool.execute(
            `SELECT * FROM pagos 
       WHERE ATLETA_ID = ? 
       ORDER BY CREATED_AT DESC`,
            [atleta_id]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo pagos del atleta:', error);
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
};

// Obtener pagos pendientes
const getPagosPendientes = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, 
              a.NOMBRE as atleta_nombre,
              a.APELLIDO as atleta_apellido,
              a.TELEFONO as atleta_telefono
       FROM pagos p
       LEFT JOIN atletas a ON p.ATLETA_ID = a.ATLETA_ID
       WHERE p.ESTATUS IN ('PENDIENTE', 'VENCIDO')
       ORDER BY p.MES_CORRESPONDIENTE DESC`
        );

        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo pagos pendientes:', error);
        res.status(500).json({ error: 'Error al obtener pagos pendientes' });
    }
};

// Crear pago
const createPago = async (req, res) => {
    try {
        const { atleta_id, mes_correspondiente, monto, estatus, fecha_pago, ref_pago } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO pagos (ATLETA_ID, MES_CORRESPONDIENTE, MONTO, ESTATUS, FECHA_PAGO, REF_PAGO) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [atleta_id, mes_correspondiente, monto, estatus || 'PENDIENTE', fecha_pago, ref_pago]
        );

        res.status(201).json({
            message: 'Pago registrado exitosamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error creando pago:', error);
        res.status(500).json({ error: 'Error al crear pago' });
    }
};

// Actualizar pago
const updatePago = async (req, res) => {
    try {
        const { id } = req.params;
        const { estatus, fecha_pago, ref_pago, monto } = req.body;

        const [result] = await pool.execute(
            `UPDATE pagos 
       SET ESTATUS = ?, FECHA_PAGO = ?, REF_PAGO = ?, MONTO = ?
       WHERE PAGO_ID = ?`,
            [estatus, fecha_pago, ref_pago, monto, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        res.json({ message: 'Pago actualizado exitosamente' });
    } catch (error) {
        console.error('Error actualizando pago:', error);
        res.status(500).json({ error: 'Error al actualizar pago' });
    }
};

// Marcar pago como pagado
const marcarComoPagado = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_pago, ref_pago } = req.body;

        const [result] = await pool.execute(
            `UPDATE pagos 
       SET ESTATUS = 'PAGADO', FECHA_PAGO = ?, REF_PAGO = ?
       WHERE PAGO_ID = ?`,
            [fecha_pago || new Date().toISOString().split('T')[0], ref_pago, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        res.json({ message: 'Pago marcado como pagado exitosamente' });
    } catch (error) {
        console.error('Error marcando pago como pagado:', error);
        res.status(500).json({ error: 'Error al actualizar pago' });
    }
};

module.exports = {
    getPagos,
    getPagosByAtleta,
    getPagosPendientes,
    createPago,
    updatePago,
    marcarComoPagado
};
