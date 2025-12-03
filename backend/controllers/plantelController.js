const pool = require('../config/database');

// Obtener todo el plantel
const getPlantel = async (req, res) => {
    try {
        const { rol } = req.query;

        let query = 'SELECT * FROM plantel WHERE 1=1';
        const params = [];

        if (rol) {
            query += ' AND ROL = ?';
            params.push(rol);
        }

        query += ' ORDER BY ROL ASC, NOMBRE ASC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo plantel:', error);
        res.status(500).json({ error: 'Error al obtener plantel' });
    }
};

// Obtener miembro del plantel por ID
const getPlantelById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute(
            'SELECT * FROM plantel WHERE PLANTEL_ID = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Miembro del plantel no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo miembro del plantel:', error);
        res.status(500).json({ error: 'Error al obtener miembro del plantel' });
    }
};

// Obtener plantel por rol
const getPlantelByRol = async (req, res) => {
    try {
        const { rol } = req.params;

        const [rows] = await pool.execute(
            'SELECT * FROM plantel WHERE ROL = ? ORDER BY NOMBRE ASC',
            [rol]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo plantel por rol:', error);
        res.status(500).json({ error: 'Error al obtener plantel' });
    }
};

// Crear miembro del plantel
const createMiembroPlantel = async (req, res) => {
    try {
        const { nombre, apellido, telefono, rol } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO plantel (NOMBRE, APELLIDO, TELEFONO, ROL) 
       VALUES (?, ?, ?, ?)`,
            [nombre, apellido, telefono, rol]
        );

        res.status(201).json({
            message: 'Miembro del plantel agregado exitosamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error creando miembro del plantel:', error);
        res.status(500).json({ error: 'Error al crear miembro del plantel' });
    }
};

// Actualizar miembro del plantel
const updateMiembroPlantel = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, rol } = req.body;

        const [result] = await pool.execute(
            `UPDATE plantel 
       SET NOMBRE = ?, APELLIDO = ?, TELEFONO = ?, ROL = ?
       WHERE PLANTEL_ID = ?`,
            [nombre, apellido, telefono, rol, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Miembro del plantel no encontrado' });
        }

        res.json({ message: 'Miembro del plantel actualizado exitosamente' });
    } catch (error) {
        console.error('Error actualizando miembro del plantel:', error);
        res.status(500).json({ error: 'Error al actualizar miembro del plantel' });
    }
};

// Eliminar miembro del plantel
const deleteMiembroPlantel = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el miembro está asignado a alguna categoría
        const [categorias] = await pool.execute(
            'SELECT COUNT(*) as total FROM categoria WHERE ENTRENADOR_ID = ?',
            [id]
        );

        if (categorias[0].total > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar porque está asignado a una o más categorías'
            });
        }

        const [result] = await pool.execute(
            'DELETE FROM plantel WHERE PLANTEL_ID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Miembro del plantel no encontrado' });
        }

        res.json({ message: 'Miembro del plantel eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando miembro del plantel:', error);
        res.status(500).json({ error: 'Error al eliminar miembro del plantel' });
    }
};

module.exports = {
    getPlantel,
    getPlantelById,
    getPlantelByRol,
    createMiembroPlantel,
    updateMiembroPlantel,
    deleteMiembroPlantel
};
