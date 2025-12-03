const pool = require('../config/database');

// Obtener todas las categorías
const getCategorias = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT c.*, 
              p.NOMBRE as entrenador_nombre,
              p.APELLIDO as entrenador_apellido,
              COUNT(a.ATLETA_ID) as total_atletas
       FROM categoria c
       LEFT JOIN plantel p ON c.ENTRENADOR_ID = p.PLANTEL_ID
       LEFT JOIN atletas a ON c.CATEGORIA_ID = a.CATEGORIA_ID AND a.ESTATUS IN ('ACTIVO', 'LESIONADO')
       GROUP BY c.CATEGORIA_ID
       ORDER BY c.EDAD_MIN ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

// Obtener categoría por ID
const getCategoriaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(
            `SELECT c.*, 
              p.NOMBRE as entrenador_nombre,
              p.APELLIDO as entrenador_apellido
       FROM categoria c
       LEFT JOIN plantel p ON c.ENTRENADOR_ID = p.PLANTEL_ID
       WHERE c.CATEGORIA_ID = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo categoría:', error);
        res.status(500).json({ error: 'Error al obtener categoría' });
    }
};

// Crear categoría
const createCategoria = async (req, res) => {
    try {
        const { nombre_categoria, edad_min, edad_max, entrenador_id } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO categoria (NOMBRE_CATEGORIA, EDAD_MIN, EDAD_MAX, ENTRENADOR_ID) 
       VALUES (?, ?, ?, ?)`,
            [nombre_categoria, edad_min, edad_max, entrenador_id]
        );

        res.status(201).json({
            message: 'Categoría creada exitosamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error creando categoría:', error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

// Actualizar categoría
const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_categoria, edad_min, edad_max, entrenador_id } = req.body;

        const [result] = await pool.execute(
            `UPDATE categoria 
       SET NOMBRE_CATEGORIA = ?, EDAD_MIN = ?, EDAD_MAX = ?, ENTRENADOR_ID = ?
       WHERE CATEGORIA_ID = ?`,
            [nombre_categoria, edad_min, edad_max, entrenador_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría actualizada exitosamente' });
    } catch (error) {
        console.error('Error actualizando categoría:', error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

// Eliminar categoría
const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si hay atletas en esta categoría
        const [atletas] = await pool.execute(
            'SELECT COUNT(*) as total FROM atletas WHERE CATEGORIA_ID = ?',
            [id]
        );

        if (atletas[0].total > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar la categoría porque tiene atletas asignados'
            });
        }

        const [result] = await pool.execute(
            'DELETE FROM categoria WHERE CATEGORIA_ID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        console.error('Error eliminando categoría:', error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};

module.exports = {
    getCategorias,
    getCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria
};
