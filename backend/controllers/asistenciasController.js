const pool = require('../config/database');

// Obtener todas las asistencias
const getAsistencias = async (req, res) => {
  try {
    const { fecha, atleta_id } = req.query;

    let query = `
      SELECT a.*, 
             atl.NOMBRE as atleta_nombre, 
             atl.APELLIDO as atleta_apellido,
             c.NOMBRE_CATEGORIA as categoria_nombre,
             p.NOMBRE as entrenador_nombre,
             p.APELLIDO as entrenador_apellido
      FROM control_asistencias a
      LEFT JOIN atletas atl ON a.ATLETA_ID = atl.ATLETA_ID
      LEFT JOIN categoria c ON atl.CATEGORIA_ID = c.CATEGORIA_ID
      LEFT JOIN plantel p ON a.ENTRENADOR_ID = p.PLANTEL_ID
      WHERE 1=1
    `;
    const params = [];

    if (fecha) {
      query += ' AND a.FECHA = ?';
      params.push(fecha);
    }

    if (atleta_id) {
      query += ' AND a.ATLETA_ID = ?';
      params.push(atleta_id);
    }

    query += ' ORDER BY a.FECHA DESC, atl.NOMBRE ASC';

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
    const { atleta_id, fecha, tipo_evento, estatus, observaciones, entrenador_id } = req.body;

    // Verificar si ya existe registro para ese atleta en esa fecha
    const [existing] = await pool.execute(
      'SELECT ASISTENCIA_ID FROM control_asistencias WHERE ATLETA_ID = ? AND FECHA = ?',
      [atleta_id, fecha]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe un registro de asistencia para este atleta en esta fecha' });
    }

    const [result] = await pool.execute(
      `INSERT INTO control_asistencias 
       (ATLETA_ID, FECHA, TIPO_EVENTO, ESTATUS, OBSERVACIONES, ENTRENADOR_ID) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [atleta_id, fecha, tipo_evento || 'ENTRENAMIENTO', estatus || 'PRESENTE', observaciones, entrenador_id]
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
              atl.NOMBRE as atleta_nombre, 
              atl.APELLIDO as atleta_apellido,
              c.NOMBRE_CATEGORIA as categoria_nombre,
              TIMESTAMPDIFF(YEAR, atl.FECHA_NACIMIENTO, CURDATE()) as edad
       FROM control_asistencias a
       LEFT JOIN atletas atl ON a.ATLETA_ID = atl.ATLETA_ID
       LEFT JOIN categoria c ON atl.CATEGORIA_ID = c.CATEGORIA_ID
       WHERE a.FECHA = ? AND atl.ESTATUS IN ('ACTIVO', 'LESIONADO')
       ORDER BY atl.NOMBRE ASC`,
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
    const { estatus, observaciones } = req.body;

    const [result] = await pool.execute(
      'UPDATE control_asistencias SET ESTATUS = ?, OBSERVACIONES = ? WHERE ASISTENCIA_ID = ?',
      [estatus, observaciones, id]
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