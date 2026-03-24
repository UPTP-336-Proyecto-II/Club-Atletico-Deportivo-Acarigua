const pool = require('../config/database');

// Obtener todos los implementos
const getImplementos = async (req, res) => {
    try {
        let query = 'SELECT * FROM implementos_deportivos ORDER BY nombre ASC';
        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo implementos:', error);
        res.status(500).json({ error: 'Error al obtener implementos' });
    }
};

// Obtener implemento por ID
const getImplementoById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.execute(
            'SELECT * FROM implementos_deportivos WHERE implemento_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Implemento no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo implemento:', error);
        res.status(500).json({ error: 'Error al obtener implemento' });
    }
};

// Crear implemento
const createImplemento = async (req, res) => {
    try {
        const { nombre, existencia, cant_uso, cant_dañado, lugar_almacen } = req.body;
        
        const existencia_num = Number(existencia) || 0;
        const uso_num = Number(cant_uso) || 0;
        const dañado_num = Number(cant_dañado) || 0;
        const disponible_num = existencia_num - uso_num - dañado_num;

        const [result] = await pool.execute(
            `INSERT INTO implementos_deportivos 
             (nombre, existencia, cant_uso, cant_dañado, cant_disponible, lugar_almacen) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, existencia_num, uso_num, dañado_num, disponible_num, lugar_almacen || null]
        );

        res.status(201).json({
            message: 'Implemento registrado exitosamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error creando implemento:', error);
        res.status(500).json({ error: 'Error al crear implemento' });
    }
};

// Actualizar implemento
const updateImplemento = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, existencia, cant_uso, cant_dañado, lugar_almacen } = req.body;

        const existencia_num = Number(existencia) || 0;
        const uso_num = Number(cant_uso) || 0;
        const dañado_num = Number(cant_dañado) || 0;
        const disponible_num = existencia_num - uso_num - dañado_num;

        const [result] = await pool.execute(
            `UPDATE implementos_deportivos 
             SET nombre = ?, existencia = ?, cant_uso = ?, cant_dañado = ?, cant_disponible = ?, lugar_almacen = ?
             WHERE implemento_id = ?`,
            [nombre, existencia_num, uso_num, dañado_num, disponible_num, lugar_almacen || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Implemento no encontrado' });
        }

        res.json({ message: 'Implemento actualizado exitosamente' });
    } catch (error) {
        console.error('Error actualizando implemento:', error);
        res.status(500).json({ error: 'Error al actualizar implemento' });
    }
};

// Eliminar implemento
const deleteImplemento = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM implementos_deportivos WHERE implemento_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Implemento no encontrado' });
        }

        res.json({ message: 'Implemento eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando implemento:', error);
        res.status(500).json({ error: 'Error al eliminar implemento' });
    }
};

module.exports = {
    getImplementos,
    getImplementoById,
    createImplemento,
    updateImplemento,
    deleteImplemento
};
