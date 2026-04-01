const pool = require('../config/database');
const addressService = require('../services/addressService');

// Obtener todo el plantel (personal)
const getPlantel = async (req, res) => {
  try {
    const { rol, sort, cedula, sin_cedula } = req.query;

    let query = `
            SELECT pl.*, r.nombre_rol, pl.personal_id as plantel_id, pl.cedula as cedula, pl.rol_personal as rol_id,
                   ${addressService.getSelectColumns()}
            FROM personal pl
            LEFT JOIN rol_usuarios r ON pl.rol_personal = r.rol_id
            ${addressService.getJoins().replace('entity.direccion_id', 'pl.direccion_id')}
            WHERE 1=1`;
    const params = [];

    if (cedula) {
      query += ' AND pl.cedula LIKE ?';
      params.push(`%${cedula}%`);
    }

    if (sin_cedula === 'true') {
      query += ' AND (pl.cedula IS NULL OR pl.cedula = \'\')';
    }

    if (rol) {
      const rolId = parseInt(rol);
      if (!isNaN(rolId)) {
        query += ' AND pl.rol_personal = ?';
        params.push(rolId);
      } else {
        query += ' AND UPPER(r.nombre_rol) = UPPER(?)';
        params.push(rol);
      }
    }

    // Ordenamiento
    let orderBy = 'pl.rol_personal ASC, pl.nombre ASC'; // Default

    switch (sort) {
      case 'reciente':
        orderBy = 'pl.created_at DESC';
        break;
      case 'antiguo':
        orderBy = 'pl.created_at ASC';
        break;
      case 'az':
        orderBy = 'pl.nombre ASC';
        break;
      case 'za':
        orderBy = 'pl.nombre DESC';
        break;
    }

    query += ` ORDER BY ${orderBy}`;

    const [rows] = await pool.execute(query, params);
    
    // Normalize properties for the frontend expecting plantel structure
    const normalizedRows = rows.map(row => ({
      ...row,
      fecha_nac: row.fecha_nacimiento
    }));
    
    res.json(normalizedRows);
  } catch (error) {
    console.error('Error obteniendo plantel:', error);
    res.status(500).json({ error: 'Error al obtener plantel' });
  }
};

// Obtener miembro del plantel por ID
const getPlantelById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT pl.*, pl.personal_id as plantel_id, pl.documento_identidad as cedula, pl.rol as rol_id, pl.fecha_nacimiento as fecha_nac,
                    ${addressService.getSelectColumns()}
             FROM personal pl
             ${addressService.getJoins().replace('entity.direccion_id', 'pl.direccion_id')}
             WHERE pl.personal_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Miembro del plantel no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo miembro del plantel:', error);
    res.status(500).json({ error: 'Error al obtener miembro del plantel' });
  }
};

// Obtener plantel por rol
const getPlantelByRol = async (req, res) => {
  try {
    const { rol } = req.params;

    const [rows] = await pool.execute(
      'SELECT *, personal_id as plantel_id, documento_identidad as cedula, rol as rol_id FROM personal WHERE rol = ? ORDER BY nombre ASC',
      [rol]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo plantel por rol:', error);
    res.status(500).json({ error: 'Error al obtener plantel' });
  }
};

// Crear miembro del plantel
const createMiembroPlantel = async (req, res) => {
  try {
    const { nombre, apellido, telefono, rol, cedula, fecha_nac, direccion } = req.body;

    let direccion_id = null;
    if (direccion) {
      direccion_id = await addressService.findOrCreateAddress(direccion);
    }

    const [result] = await pool.execute(
      `INSERT INTO personal (nombre, apellido, telefono, rol, documento_identidad, fecha_nacimiento, direccion_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, telefono, rol, cedula || null, fecha_nac || null, direccion_id]
    );

    res.status(201).json({
      message: 'Miembro del plantel agregado exitosamente',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error creando miembro del plantel:', error);
    res.status(500).json({ error: 'Error al crear miembro del plantel' });
  }
};

// Actualizar miembro del plantel
const updateMiembroPlantel = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, rol, cedula, fecha_nac, direccion } = req.body;

    let finalDireccionId = undefined;
    if (direccion) {
      finalDireccionId = await addressService.findOrCreateAddress(direccion);
    } else {
      const [existing] = await pool.execute('SELECT direccion_id FROM personal WHERE personal_id = ?', [id]);
      if (existing.length > 0) finalDireccionId = existing[0].direccion_id;
    }

    // Actualizar miembro
    const [result] = await pool.execute(
      `UPDATE personal 
       SET nombre = ?, apellido = ?, telefono = ?, rol = ?, documento_identidad = ?, fecha_nacimiento = ?, direccion_id = ?
       WHERE personal_id = ?`,
      [nombre, apellido, telefono, rol, cedula || null, fecha_nac || null, finalDireccionId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Miembro del plantel no encontrado' });
    }

    res.json({ message: 'Miembro del plantel actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando miembro del plantel:', error);
    res.status(500).json({ error: 'Error al actualizar miembro del plantel' });
  }
};

// Eliminar miembro del plantel
const deleteMiembroPlantel = async (req, res) => {
  try {
    const { id } = req.params;

    const [categorias] = await pool.execute(
      'SELECT COUNT(*) as total FROM categoria WHERE entrenador_id = ?',
      [id]
    );

    if (categorias[0].total > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar porque está asignado a una o más categorías'
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM personal WHERE personal_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Miembro del plantel no encontrado' });
    }

    res.json({ message: 'Miembro del plantel eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando miembro del plantel:', error);
    res.status(500).json({ error: 'Error al eliminar miembro del plantel' });
  }
};

module.exports = {
  getPlantel,
  getPlantelById,
  getPlantelByRol,
  createMiembroPlantel,
  updateMiembroPlantel,
  deleteMiembroPlantel
};