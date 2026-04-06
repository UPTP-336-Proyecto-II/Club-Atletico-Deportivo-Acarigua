const pool = require('../config/database');
const { hasTable, isLegacySchema } = require('../services/schemaService');

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const normalizeAttendanceStatus = (value) => {
  if (value === undefined || value === null || value === '') {
    return 'presente';
  }

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue) && String(value).trim() !== '') {
    if (numericValue === 0 || numericValue === 3) return 'ausente';
    if (numericValue === 2 || numericValue === 4) return 'justificativo';
    return 'presente';
  }

  const normalized = normalizeText(value);

  if (['presente', 'asiste', 'asistencia'].includes(normalized)) return 'presente';
  if (['ausente', 'inasistencia', 'falta'].includes(normalized)) return 'ausente';
  if (['justificado', 'justificativo', 'falta justificada', 'reposo'].includes(normalized)) return 'justificativo';

  return 'presente';
};

const mapAttendanceStatusToDb = (value) => {
  const normalized = normalizeAttendanceStatus(value);

  if (normalized === 'ausente') return 0;
  if (normalized === 'justificativo') return 2;
  return 1;
};

const normalizeActivityType = (value) => {
  if (value === undefined || value === null || value === '') {
    return 'Entrenamiento';
  }

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue) && String(value).trim() !== '') {
    if (numericValue === 0) return 'Partido';
    if (numericValue === 2 || numericValue === 3 || numericValue === 4) return 'Evento especial';
    return 'Entrenamiento';
  }

  const normalized = normalizeText(value);

  if (normalized.includes('entren')) return 'Entrenamiento';
  if (normalized.includes('partid') || normalized.includes('amistoso') || normalized.includes('torneo')) return 'Partido';
  if (normalized.includes('evento') || normalized.includes('evaluacion')) return 'Evento especial';

  return 'Entrenamiento';
};

const mapActivityTypeToDb = (value) => {
  const normalized = normalizeActivityType(value);

  if (normalized === 'Partido') return 0;
  if (normalized === 'Evento especial') return 2;
  return 1;
};

const resolveTrainerJoin = async () => {
  if (await isLegacySchema()) {
    return {
      select: 'p.nombre as entrenador_nombre, p.apellido as entrenador_apellido',
      join: 'LEFT JOIN personal p ON c.entrenador_id = p.personal_id'
    };
  }

  if (await hasTable('plantel')) {
    return {
      select: 'p.nombre as entrenador_nombre, p.apellido as entrenador_apellido',
      join: 'LEFT JOIN plantel p ON c.entrenador_id = p.plantel_id'
    };
  }

  if (await hasTable('personal')) {
    return {
      select: 'p.nombre as entrenador_nombre, p.apellido as entrenador_apellido',
      join: 'LEFT JOIN personal p ON c.entrenador_id = p.personal_id'
    };
  }

  return {
    select: 'NULL as entrenador_nombre, NULL as entrenador_apellido',
    join: ''
  };
};

const getOrCreateActividad = async(fecha, tipoActividadDb) => {
  const [existing] = await pool.execute(
    `SELECT actividad_id
     FROM actividades
     WHERE fecha = ? AND tipo_actividad = ?
     ORDER BY actividad_id DESC
     LIMIT 1`,
    [fecha, tipoActividadDb]
  );

  if (existing.length > 0) {
    return existing[0].actividad_id;
  }

  const [result] = await pool.execute(
    `INSERT INTO actividades (tipo_actividad, objetivo_principal, fecha, estatus)
     VALUES (?, ?, ?, ?)`,
    [tipoActividadDb, `Control de asistencia - ${normalizeActivityType(tipoActividadDb)}`, fecha, 1]
  );

  return result.insertId;
};

const getAsistencias = async(req, res) => {
  try {
    const { fecha, atleta_id, categoria_id } = req.query;
    const trainerJoin = await resolveTrainerJoin();

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
             ${trainerJoin.select}
      FROM asistencias a
      INNER JOIN actividades act ON a.actividad_id = act.actividad_id
      LEFT JOIN atletas atl ON a.atleta_id = atl.atleta_id
      LEFT JOIN categoria c ON atl.categoria_id = c.categoria_id
      ${trainerJoin.join}
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

    const normalizedRows = rows.map(row => ({
      ...row,
      estatus: normalizeAttendanceStatus(row.estatus),
      tipo_evento: normalizeActivityType(row.tipo_evento)
    }));

    res.json(normalizedRows);
  } catch (error) {
    console.error('Error obteniendo asistencias:', error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

const createAsistencia = async(req, res) => {
  try {
    const {
      atleta_id,
      fecha,
      tipo_evento,
      estatus,
      observaciones
    } = req.body;

    if (!atleta_id || !fecha) {
      return res.status(400).json({ error: 'atleta_id y fecha son requeridos' });
    }

    const estatusValue = mapAttendanceStatusToDb(estatus);
    const tipoEventoValue = mapActivityTypeToDb(tipo_evento);
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

const getAsistenciasByFecha = async(req, res) => {
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
       WHERE act.fecha = ?
         AND (atl.estatus IN (1, 2) OR UPPER(COALESCE(atl.estatus, '')) IN ('ACTIVO', 'LESIONADO'))
       ORDER BY atl.nombre ASC`,
      [fecha]
    );

    const normalizedRows = rows.map(row => ({
      ...row,
      estatus: normalizeAttendanceStatus(row.estatus),
      tipo_evento: normalizeActivityType(row.tipo_evento)
    }));

    res.json(normalizedRows);
  } catch (error) {
    console.error('Error obteniendo asistencias por fecha:', error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

const updateAsistencia = async(req, res) => {
  try {
    const { id } = req.params;
    const { estatus, observaciones } = req.body;

    const updates = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(req.body, 'estatus')) {
      updates.push('estatus = ?');
      params.push(mapAttendanceStatusToDb(estatus));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'observaciones')) {
      updates.push('observaciones = ?');
      params.push(observaciones || '');
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    params.push(id);

    const [result] = await pool.execute(
      `UPDATE asistencias SET ${updates.join(', ')} WHERE asistencia_id = ?`,
      params
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

const deleteAsistencia = async(req, res) => {
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
