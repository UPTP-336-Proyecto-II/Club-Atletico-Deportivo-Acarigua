const pool = require('../config/database');

// Obtener todas las asistencias
const getAsistencias = async (req, res) => {
  try {
    const { fecha, atleta_id } = req.query;
    
    let query = `
      SELECT a.*, 
             atl.nombre as atleta_nombre, 
             atl.apellido as atleta_apellido,
             atl.categoria as atleta_categoria,
             u.nombre as usuario_nombre
      FROM asistencias a
      LEFT JOIN atletas atl ON a.atleta_id = atl.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha) {
      query += ' AND a.fecha = ?';
      params.push(fecha);
    }

    if (atleta_id) {
      query += ' AND a.atleta_id = ?';
      params.push(atleta_id);
    }

    query += ' ORDER BY a.fecha DESC, atl.nombre ASC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo asistencias:', error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

// Registrar asistencia
const createAsistencia = async (req, res) => {
  try {
    const { atleta_id, fecha, estado, observaciones, usuario_id } = req.body;

    // Verificar si ya existe registro para ese atleta en esa fecha
    const [existing] = await pool.execute(
      'SELECT id FROM asistencias WHERE atleta_id = ? AND fecha = ?',
      [atleta_id, fecha]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe un registro de asistencia para este atleta en esta fecha' });
    }

    const [result] = await pool.execute(
      `INSERT INTO asistencias 
       (atleta_id, fecha, estado, observaciones, usuario_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [atleta_id, fecha, estado || 'presente', observaciones, usuario_id]
    );

    res.status(201).json({ 
      message: 'Asistencia registrada exitosamente', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('Error registrando asistencia:', error);
    res.status(500).json({ error: 'Error al registrar asistencia' });
  }
};

// Obtener asistencias por fecha
const getAsistenciasByFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT a.*, 
              atl.nombre as atleta_nombre, 
              atl.apellido as atleta_apellido,
              atl.categoria as atleta_categoria,
              TIMESTAMPDIFF(YEAR, atl.fecha_nacimiento, CURDATE()) as edad
       FROM asistencias a
       LEFT JOIN atletas atl ON a.atleta_id = atl.id
       WHERE a.fecha = ? AND atl.activo = true
       ORDER BY atl.nombre ASC`,
      [fecha]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo asistencias por fecha:', error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

// Actualizar asistencia
const updateAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    const [result] = await pool.execute(
      'UPDATE asistencias SET estado = ?, observaciones = ? WHERE id = ?',
      [estado, observaciones, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro de asistencia no encontrado' });
    }

    res.json({ message: 'Asistencia actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando asistencia:', error);
    res.status(500).json({ error: 'Error al actualizar asistencia' });
  }
};

module.exports = {
  getAsistencias,
  createAsistencia,
  getAsistenciasByFecha,
  updateAsistencia
};