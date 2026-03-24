const pool = require('../config/database');

// Obtener todas los tipos de discapacidad (cat_tipos_discapacidad)
const getTiposDiscapacidad = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM cat_tipos_discapacidad');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tipos discapacidad:', error);
    res.status(500).json({ error: 'Error al obtener los tipos de discapacidad' });
  }
};

// Obtener el carnet de un atleta específico a partir de ficha_id (o asumimos que `ficha_id` se refiere a la ficha médica, o al propio atleta_id)
// Basado en el schema, ficha_id parece referirse al atleta oa la ficha medica. Para simplificar, buscaremos por ficha_id = atleta_id si es posible.
// El schema dice: `ficha_id` int(11) DEFAULT NULL. 
const getCarnetByAtleta = async (req, res) => {
  try {
    const { id } = req.params; // atleta_id
    // Buscamos primero la ficha médica de ese atleta
    const [fichas] = await pool.execute('SELECT ficha_id FROM ficha_medica WHERE atleta_id = ?', [id]);
    
    if (fichas.length === 0) {
      return res.json(null); // No tiene ficha médica, por tanto no tiene carnet
    }
    const fichaId = fichas[0].ficha_id;

    const [rows] = await pool.execute(`
      SELECT c.*, t.nombre_tipo
      FROM carnet_discapacidad c
      LEFT JOIN cat_tipos_discapacidad t ON c.tipo_discapacidad_id = t.tipos_discapacidad_id
      WHERE c.ficha_id = ?
    `, [fichaId]);

    res.json(rows.length ? rows[0] : null);
  } catch (error) {
    console.error('Error fetching carnet discapacidad:', error);
    res.status(500).json({ error: 'Error al obtener el carnet de discapacidad' });
  }
};

const createCarnet = async (req, res) => {
  try {
    const { atleta_id, tipo_discapacidad_id, nro_carnet, porcentaje_discapacidad, fecha_registro } = req.body;

    // Obtener la ficha médica
    let [fichas] = await pool.execute('SELECT ficha_id FROM ficha_medica WHERE atleta_id = ?', [atleta_id]);
    
    // Si no tiene ficha medica creada, el frontend deberia asegurar que exista antes o cremos una por default acasa si se necesita.
    if (fichas.length === 0) {
      return res.status(400).json({ error: 'El atleta debe tener una Ficha Médica creada primero para asignarle un carnet.' });
    }
    const fichaId = fichas[0].ficha_id;

    const [result] = await pool.execute(
      `INSERT INTO carnet_discapacidad 
       (ficha_id, tipo_discapacidad_id, nro_carnet, porcentaje_discapacidad, fecha_registro)
       VALUES (?, ?, ?, ?, ?)`,
      [fichaId, tipo_discapacidad_id, nro_carnet || null, porcentaje_discapacidad || null, fecha_registro || null]
    );

    res.status(201).json({ id: result.insertId, message: 'Carnet registrado correctamente' });
  } catch (error) {
    console.error('Error creating carnet discapacidad:', error);
    res.status(500).json({ error: 'Error al registrar el carnet de discapacidad' });
  }
};

const updateCarnet = async (req, res) => {
  try {
    const { id } = req.params; // id de carnet_discapacidad
    const { tipo_discapacidad_id, nro_carnet, porcentaje_discapacidad, fecha_registro } = req.body;

    await pool.execute(
      `UPDATE carnet_discapacidad 
       SET tipo_discapacidad_id = ?, nro_carnet = ?, porcentaje_discapacidad = ?, fecha_registro = ?
       WHERE id = ?`,
      [tipo_discapacidad_id, nro_carnet || null, porcentaje_discapacidad || null, fecha_registro || null, id]
    );

    res.json({ message: 'Carnet actualizado correctamente' });
  } catch (error) {
    console.error('Error updating carnet discapacidad:', error);
    res.status(500).json({ error: 'Error al actualizar el carnet de discapacidad' });
  }
};

const deleteCarnet = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM carnet_discapacidad WHERE id = ?', [id]);
    res.json({ message: 'Carnet eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting carnet discapacidad:', error);
    res.status(500).json({ error: 'Error al eliminar el carnet de discapacidad' });
  }
};

module.exports = {
  getTiposDiscapacidad,
  getCarnetByAtleta,
  createCarnet,
  updateCarnet,
  deleteCarnet
};
