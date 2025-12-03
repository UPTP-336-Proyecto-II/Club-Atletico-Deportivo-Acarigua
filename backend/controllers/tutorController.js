const pool = require('../config/database');

// Obtener todos los tutores
const getTutores = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT t.*,
              COUNT(a.ATLETA_ID) as total_atletas
       FROM tutor t
       LEFT JOIN atletas a ON t.TUTOR_ID = a.TUTOR_ID
       GROUP BY t.TUTOR_ID
       ORDER BY t.NOMBRE_COMPLETO ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo tutores:', error);
        res.status(500).json({ error: 'Error al obtener tutores' });
    }
};

// Obtener tutor por ID
const getTutorById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute(
            'SELECT * FROM tutor WHERE TUTOR_ID = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tutor no encontrado' });
        }

        // Obtener atletas asociados
        const [atletas] = await pool.execute(
            `SELECT ATLETA_ID, NOMBRE, APELLIDO 
       FROM atletas 
       WHERE TUTOR_ID = ? AND ESTATUS IN ('ACTIVO', 'LESIONADO')`,
            [id]
        );

        res.json({
            ...rows[0],
            atletas
        });
    } catch (error) {
        console.error('Error obteniendo tutor:', error);
        res.status(500).json({ error: 'Error al obtener tutor' });
    }
};

// Crear tutor
const createTutor = async (req, res) => {
    try {
        const { nombre_completo, telefono, correo, direccion, tipo_relacion } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO tutor (NOMBRE_COMPLETO, TELEFONO, CORREO, DIRECCION, TIPO_RELACION) 
       VALUES (?, ?, ?, ?, ?)`,
            [nombre_completo, telefono, correo, direccion, tipo_relacion]
        );

        res.status(201).json({
            message: 'Tutor registrado exitosamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error creando tutor:', error);
        res.status(500).json({ error: 'Error al crear tutor' });
    }
};

// Actualizar tutor
const updateTutor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, telefono, correo, direccion, tipo_relacion } = req.body;

        const [result] = await pool.execute(
            `UPDATE tutor 
       SET NOMBRE_COMPLETO = ?, TELEFONO = ?, CORREO = ?, DIRECCION = ?, TIPO_RELACION = ?
       WHERE TUTOR_ID = ?`,
            [nombre_completo, telefono, correo, direccion, tipo_relacion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tutor no encontrado' });
        }

        res.json({ message: 'Tutor actualizado exitosamente' });
    } catch (error) {
        console.error('Error actualizando tutor:', error);
        res.status(500).json({ error: 'Error al actualizar tutor' });
    }
};

// Eliminar tutor
const deleteTutor = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si hay atletas asociados
        const [atletas] = await pool.execute(
            'SELECT COUNT(*) as total FROM atletas WHERE TUTOR_ID = ?',
            [id]
        );

        if (atletas[0].total > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar el tutor porque tiene atletas asociados'
            });
        }

        const [result] = await pool.execute(
            'DELETE FROM tutor WHERE TUTOR_ID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tutor no encontrado' });
        }

        res.json({ message: 'Tutor eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando tutor:', error);
        res.status(500).json({ error: 'Error al eliminar tutor' });
    }
};

module.exports = {
    getTutores,
    getTutorById,
    createTutor,
    updateTutor,
    deleteTutor
};
