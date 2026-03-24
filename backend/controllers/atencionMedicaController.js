const pool = require('../config/database');

// Obtener todas las atenciones médicas de un atleta
const getAtencionesByAtleta = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(`
      SELECT am.*, p.nombre as especialista_nombre, p.apellido as especialista_apellido
      FROM atencion_medica am
      LEFT JOIN personal p ON am.especialista_id = p.personal_id
      WHERE am.atleta_id = ?
      ORDER BY am.fecha_suceso DESC
    `, [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching atenciones medicas:', error);
    res.status(500).json({ error: 'Error al obtener atenciones medicas' });
  }
};

// Crear una nueva atención médica
const createAtencion = async (req, res) => {
  try {
    const { 
      atleta_id, tipo_registro, descripcion, diagnostico, 
      fecha_suceso, fecha_alta_estimada, fecha_alta_real, 
      tratamiento_indicado, especialista_id, estado_disponibilidad 
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO atencion_medica 
       (atleta_id, tipo_registro, descripcion, diagnostico, fecha_suceso, fecha_alta_estimada, fecha_alta_real, tratamiento_indicado, especialista_id, estado_disponibilidad)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [atleta_id, tipo_registro, descripcion, diagnostico || null, fecha_suceso, fecha_alta_estimada || null, fecha_alta_real || null, tratamiento_indicado || null, especialista_id, estado_disponibilidad || 0]
    );

    res.status(201).json({ id: result.insertId, message: 'Atención médica registrada correctamente' });
  } catch (error) {
    console.error('Error creating atencion medica:', error);
    res.status(500).json({ error: 'Error al registrar la atención médica' });
  }
};

// Actualizar una atención médica
const updateAtencion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      tipo_registro, descripcion, diagnostico, 
      fecha_suceso, fecha_alta_estimada, fecha_alta_real, 
      tratamiento_indicado, especialista_id, estado_disponibilidad 
    } = req.body;

    await pool.execute(
      `UPDATE atencion_medica 
       SET tipo_registro = ?, descripcion = ?, diagnostico = ?, fecha_suceso = ?, fecha_alta_estimada = ?, fecha_alta_real = ?, tratamiento_indicado = ?, especialista_id = ?, estado_disponibilidad = ?
       WHERE atencion_id = ?`,
      [tipo_registro, descripcion, diagnostico || null, fecha_suceso, fecha_alta_estimada || null, fecha_alta_real || null, tratamiento_indicado || null, especialista_id, estado_disponibilidad || 0, id]
    );

    res.json({ message: 'Atención médica actualizada correctamente' });
  } catch (error) {
    console.error('Error updating atencion medica:', error);
    res.status(500).json({ error: 'Error al actualizar la atención médica' });
  }
};

// Eliminar una atención médica
const deleteAtencion = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM atencion_medica WHERE atencion_id = ?', [id]);
    res.json({ message: 'Atención médica eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting atencion medica:', error);
    res.status(500).json({ error: 'Error al eliminar la atención médica' });
  }
};

module.exports = {
  getAtencionesByAtleta,
  createAtencion,
  updateAtencion,
  deleteAtencion
};
