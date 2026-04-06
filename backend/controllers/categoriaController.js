const pool = require('../config/database');
const { hasTable, isLegacySchema } = require('../services/schemaService');

const normalizeText = (value) => String(value || '').trim();

const resolveTrainerJoin = async() => {
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

const getCategorias = async(req, res) => {
  try {
    const { estatus } = req.query;
    const trainerJoin = await resolveTrainerJoin();

    let query = `SELECT c.*,
                ${trainerJoin.select},
                COUNT(a.atleta_id) as total_atletas
         FROM categoria c
         ${trainerJoin.join}
         LEFT JOIN atletas a ON c.categoria_id = a.categoria_id
            AND (a.estatus IN (1, 2) OR UPPER(COALESCE(a.estatus, '')) IN ('ACTIVO', 'LESIONADO'))`;

    const params = [];

    if (estatus) {
      query += ' WHERE c.estatus = ?';
      params.push(estatus);
    }

    query += ' GROUP BY c.categoria_id ORDER BY c.edad_min ASC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo categorias:', error);
    res.status(500).json({ error: 'Error al obtener categorias' });
  }
};

const getCategoriaById = async(req, res) => {
  try {
    const { id } = req.params;
    const trainerJoin = await resolveTrainerJoin();

    const [rows] = await pool.execute(
      `SELECT c.*,
                ${trainerJoin.select}
         FROM categoria c
         ${trainerJoin.join}
         WHERE c.categoria_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo categoria:', error);
    res.status(500).json({ error: 'Error al obtener categoria' });
  }
};

const updateCategoria = async(req, res) => {
  try {
    const { id } = req.params;
    const { nombre_categoria, entrenador_id, estatus, edad_min, edad_max } = req.body;

    const [existingRows] = await pool.execute(
      'SELECT categoria_id, nombre_categoria, edad_min, edad_max FROM categoria WHERE categoria_id = ?',
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }

    const existing = existingRows[0];
    const updates = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(req.body, 'nombre_categoria')) {
      const nombreNormalizado = normalizeText(nombre_categoria);
      if (!nombreNormalizado) {
        return res.status(400).json({ error: 'El nombre de la categoria es requerido' });
      }

      const [duplicate] = await pool.execute(
        'SELECT categoria_id FROM categoria WHERE LOWER(TRIM(nombre_categoria)) = LOWER(?) AND categoria_id != ? LIMIT 1',
        [nombreNormalizado, id]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({ error: 'Ya existe una categoria con ese nombre' });
      }

      updates.push('nombre_categoria = ?');
      params.push(nombreNormalizado);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'entrenador_id')) {
      updates.push('entrenador_id = ?');
      params.push(entrenador_id || null);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'estatus')) {
      const estatusNormalizado = normalizeText(estatus).toLowerCase();
      if (!['activa', 'inactiva'].includes(estatusNormalizado)) {
        return res.status(400).json({ error: 'Estatus invalido. Use Activa o Inactiva' });
      }

      updates.push('estatus = ?');
      params.push(estatusNormalizado === 'activa' ? 'Activa' : 'Inactiva');
    }

    const finalEdadMin = Object.prototype.hasOwnProperty.call(req.body, 'edad_min')
      ? Number(edad_min)
      : Number(existing.edad_min);
    const finalEdadMax = Object.prototype.hasOwnProperty.call(req.body, 'edad_max')
      ? Number(edad_max)
      : Number(existing.edad_max);

    if (Object.prototype.hasOwnProperty.call(req.body, 'edad_min')) {
      if (!Number.isInteger(finalEdadMin) || finalEdadMin < 0) {
        return res.status(400).json({ error: 'edad_min invalida' });
      }
      updates.push('edad_min = ?');
      params.push(finalEdadMin);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'edad_max')) {
      if (!Number.isInteger(finalEdadMax) || finalEdadMax < 0) {
        return res.status(400).json({ error: 'edad_max invalida' });
      }
      updates.push('edad_max = ?');
      params.push(finalEdadMax);
    }

    if (finalEdadMin > finalEdadMax) {
      return res.status(400).json({ error: 'La edad minima no puede ser mayor a la edad maxima' });
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    params.push(id);

    await pool.execute(
      `UPDATE categoria
       SET ${updates.join(', ')}
       WHERE categoria_id = ?`,
      params
    );

    res.json({ message: 'Categoria actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando categoria:', error);
    res.status(500).json({ error: 'Error al actualizar categoria' });
  }
};

module.exports = {
  getCategorias,
  getCategoriaById,
  updateCategoria
};
