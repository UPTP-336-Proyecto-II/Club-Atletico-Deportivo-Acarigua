const pool = require('../config/database');

const getOrCreateActividad = async (fecha, tipo_evento) => {
  const [existing] = await pool.execute(
    `SELECT actividad_id
     FROM actividades
     WHERE fecha = ? AND tipo_actividad = ?
     ORDER BY actividad_id DESC
     LIMIT 1`,
    [fecha, tipo_evento]
  );

  if (existing.length > 0) {
    return existing[0].actividad_id;
  }

  const [result] = await pool.execute(
    `INSERT INTO actividades (tipo_actividad, objetivo_principal, fecha, estatus)
     VALUES (?, ?, ?, ?)`,
    [tipo_evento, `Control de asistencia - Evento Tipo ${tipo_evento}`, fecha, 1]
  );

  return result.insertId;
};

const getAsistencias = async (req, res) => {
  try {
    const { fecha, atleta_id, categoria_id } = req.query;

    let query = `
          SELECT a.asistencia_id,
                 a.actividad_id as evento_id,
                 a.atleta_id,
                 a.estatus,
                 a.observaciones,
                 act.fecha as fecha,
                 act.tipo_actividad as tipo_evento,
                 c.entrenador_id,
                 atl.nombre as atleta_nombre,
                 atl.apellido as atleta_apellido,
                 atl.foto,
                 c.nombre_categoria as categoria_nombre,
                 p.nombre as entrenador_nombre,
                 p.apellido as entrenador_apellido
          FROM asistencias a
          INNER JOIN actividades act ON a.actividad_id = act.actividad_id
          LEFT JOIN atletas atl ON a.atleta_id = atl.atleta_id
          LEFT JOIN categoria c ON atl.categoria_id = c.categoria_id
          LEFT JOIN personal p ON c.entrenador_id = p.personal_id
          WHERE 1=1`;
    
    const params = [];

    if (fecha) {
      query += ' AND act.fecha = ?';
      params.push(fecha);
    }

    if (atleta_id) {
      query += ' AND a.atleta_id = ?';
      params.push(atleta_id);
    }

    if (categoria_id) {
      query += ' AND atl.categoria_id = ?';
      params.push(categoria_id);
    }

    query += ' ORDER BY act.fecha DESC, atl.nombre ASC';

    const [rows] = await pool.execute(query, params);
    
    // Normalizar estatus a nombres string para el frontend usando el objeto local
    const estatusMap = { 1: 'Asiste', 2: 'Falta Justificada', 3: 'Inasistencia', 4: 'Reposo' };
    const tipoEventoMap = { 1: 'Entrenamiento', 2: 'Partido Amistoso', 3: 'Torneo Oficial', 4: 'Evaluación Técnica' };

    const normalizedRows = rows.map(row => ({
      ...row,
      estatus: estatusMap[row.estatus] || 'Desconocido',
      tipo_evento: tipoEventoMap[row.tipo_evento] || 'General'
    }));

    res.json(normalizedRows);
  } catch (error) {
    console.error('Error obteniendo asistencias:', error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

const createAsistencia = async (req, res) => {
  try {
    const { atleta_id, fecha, tipo_evento, estatus, observaciones } = req.body;
    
    // Map estatus to DB values
    const estatusDbMap = { 'Asiste': 1, 'Falta Justificada': 2, 'Inasistencia': 3, 'Reposo': 4 };
    const estatusValue = estatusDbMap[estatus] || 1;

    // Map tipo_evento to DB values  
    const tipoEventoDbMap = { 'Entrenamiento': 1, 'Partido Amistoso': 2, 'Torneo Oficial': 3, 'Evaluación Técnica': 4, 'General': 1 };
    const tipoEventoValue = tipoEventoDbMap[tipo_evento] || 1;

    const actividad_id = await getOrCreateActividad(fecha, tipoEventoValue);

    const [existing] = await pool.execute(
      'SELECT asistencia_id FROM asistencias WHERE atleta_id = ? AND actividad_id = ?',
      [atleta_id, actividad_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Ya existe un registro de asistencia para este atleta en este evento'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO asistencias (actividad_id, atleta_id, estatus, observaciones)
       VALUES (?, ?, ?, ?)`,
      [actividad_id, atleta_id, estatusValue, observaciones || '']
    );

    res.status(200).json({
      message: 'Asistencia registrada exitosamente',
      id: result.insertId,
      evento_id: actividad_id
    });
  } catch (error) {
    console.error('Error registrando asistencia:', error);
    res.status(500).json({ error: 'Error al registrar asistencia' });
  }
};

const getAsistenciasByFecha = async (req, res) => {
  try {
    const { fecha } = req.params;

    const [rows] = await pool.execute(
      `SELECT a.asistencia_id,
                a.actividad_id as evento_id,
                a.atleta_id,
                a.estatus,
                a.observaciones,
                act.fecha as fecha,
                act.tipo_actividad as tipo_evento,
                atl.nombre as atleta_nombre,
                atl.apellido as atleta_apellido,
                atl.foto,
                c.nombre_categoria as categoria_nombre,
                TIMESTAMPDIFF(YEAR, atl.fecha_nacimiento, CURDATE()) as edad
         FROM asistencias a
         INNER JOIN actividades act ON a.actividad_id = act.actividad_id
         LEFT JOIN atletas atl ON a.atleta_id = atl.atleta_id
         LEFT JOIN categoria c ON atl.categoria_id = c.categoria_id
         WHERE act.fecha = ? AND atl.estatus IN (1, 2)
         ORDER BY atl.nombre ASC`,
      [fecha]
    );

    const estatusMap = { 1: 'Asiste', 2: 'Falta Justificada', 3: 'Inasistencia', 4: 'Reposo' };
    const tipoEventoMap = { 1: 'Entrenamiento', 2: 'Partido Amistoso', 3: 'Torneo Oficial', 4: 'Evaluación Técnica' };

    const normalizedRows = rows.map(row => ({
      ...row,
      estatus: estatusMap[row.estatus] || 'Desconocido',
      tipo_evento: tipoEventoMap[row.tipo_evento] || 'General'
    }));

    res.json(normalizedRows);
  } catch (error) {
    console.error('Error obteniendo asistencias por fecha:', error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

const updateAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { estatus, observaciones } = req.body;
    
    // Map estatus to DB values
    const estatusDbMap = { 'Asiste': 1, 'Falta Justificada': 2, 'Inasistencia': 3, 'Reposo': 4 };
    const estatusValue = estatusDbMap[estatus] || 1;

    const [result] = await pool.execute(
      'UPDATE asistencias SET estatus = ?, observaciones = ? WHERE asistencia_id = ?',
      [estatusValue, observaciones || '', id]
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

const deleteAsistencia = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM asistencias WHERE asistencia_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro de asistencia no encontrado' });
    }

    res.json({ message: 'Asistencia eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando asistencia:', error);
    res.status(500).json({ error: 'Error al eliminar asistencia' });
  }
};

module.exports = {
  getAsistencias,
  createAsistencia,
  getAsistenciasByFecha,
  updateAsistencia,
  deleteAsistencia
};
