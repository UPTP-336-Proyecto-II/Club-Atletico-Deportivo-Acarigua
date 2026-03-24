const pool = require('../config/database');

// Obtener el historial de partidos por categoria_id
const getHistorialByCategoria = async (req, res) => {
  try {
    const { id } = req.params; // recibimos el categoria_id

    const [rows] = await pool.execute(`
      SELECT * 
      FROM historial_partidos
      WHERE cateogira_id = ?
      ORDER BY fecha_partido DESC
    `, [id]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching historial partidos:', error);
    res.status(500).json({ error: 'Error al obtener el historial de partidos' });
  }
};

module.exports = {
  getHistorialByCategoria
};
