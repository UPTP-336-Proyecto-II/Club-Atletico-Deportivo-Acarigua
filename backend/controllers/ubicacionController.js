const pool = require('../config/database');

const getEstados = async (req, res) => {
  try {
    const query = 'SELECT estado_id as id, estado as nombre FROM estados ORDER BY estado ASC';
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estados:', error);
    res.status(500).json({ error: 'Error al obtener estados', details: error.message });
  }
};

const getMunicipiosByEstado = async (req, res) => {
  try {
    const { estado_id } = req.params;
    const query = 'SELECT municipio_id as id, municipio as nombre FROM municipios WHERE estadoi_id = ? ORDER BY municipio ASC';
    const [rows] = await pool.execute(query, [estado_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo municipios:', error);
    res.status(500).json({ error: 'Error al obtener municipios', details: error.message });
  }
};

const getParroquiasByMunicipio = async (req, res) => {
  try {
    const { municipio_id } = req.params;
    const query = 'SELECT parroquia_id as id, parroquia as nombre FROM parroquias WHERE municipio_id = ? ORDER BY parroquia ASC';
    const [rows] = await pool.execute(query, [municipio_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo parroquias:', error);
    res.status(500).json({ error: 'Error al obtener parroquias', details: error.message });
  }
};

module.exports = {
  getEstados,
  getMunicipiosByEstado,
  getParroquiasByMunicipio
};
