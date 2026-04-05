const pool = require('../config/database')
const addressService = require('../services/addressService')

const getTutores = async (req, res) => {
  try {
    const { sort, search } = req.query

    let query = `
           SELECT r.*,
                  r.nombre_completo,
                  COUNT(a.atleta_id) as total_atletas
           FROM representante r
           LEFT JOIN atletas a ON r.representante_id = a.representante_id
           WHERE 1=1 `
    const params = []

    if (search) {
      query += ` AND (LOWER(r.nombre_completo) LIKE LOWER(?) OR r.cedula LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' GROUP BY r.representante_id'

    let orderBy = 'r.nombre_completo ASC'
    switch (sort) {
      case 'reciente':
        orderBy = 'r.created_at DESC'
        break
      case 'antiguo':
        orderBy = 'r.created_at ASC'
        break
      case 'az':
        orderBy = 'r.nombre_completo ASC'
        break
      case 'za':
        orderBy = 'r.nombre_completo DESC'
        break
    }

    query += ` ORDER BY ${orderBy}`

    const [rows] = await pool.execute(query, params)
    res.json(rows)
  } catch (error) {
    console.error('Error obteniendo representantes:', error)
    res.status(500).json({ error: 'Error al obtener representantes' })
  }
}

const getTutorById = async (req, res) => {
  try {
    const { id } = req.params

    const [rows] = await pool.execute(
      `SELECT r.*,
              r.nombre_completo,
              ${addressService.getSelectColumns().replace(/d\./g, 'd.').replace(/e\./g, 'e.').replace(/m\./g, 'm.').replace(/p\./g, 'p.')}
       FROM representante r
       ${addressService.getJoins().replace('entity.direccion_id', 'r.direccion_id')}
       WHERE r.representante_id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Representante no encontrado' })
    }

    const [atletas] = await pool.execute(
      `SELECT atleta_id, nombre, apellido
       FROM atletas
       WHERE representante_id = ? AND estatus IN (1, 2)`,
      [id]
    )

    res.json({
      ...rows[0],
      atletas
    })
  } catch (error) {
    console.error('Error obteniendo representante:', error)
    res.status(500).json({ error: 'Error al obtener representante' })
  }
}

const createTutor = async (req, res) => {
  try {
    const { nombre_completo, nombres, apellidos, cedula, telefono, correo, direccion, tipo_relacion } = req.body

    let direccion_id = null
    if (direccion) {
      direccion_id = await addressService.findOrCreateAddress(direccion)
    }

    // Support both nombre_completo and nombres+apellidos
    const finalNombreCompleto = nombre_completo || `${nombres || ''} ${apellidos || ''}`.trim()

    const safeCedula = cedula || 'S/N'
    const safeTelefono = telefono || 'S/N'
    const safeDireccionId = direccion_id || 1

    if (safeCedula !== 'S/N') {
      const [existingRep] = await pool.execute('SELECT representante_id FROM representante WHERE cedula = ?', [safeCedula])
      if (existingRep.length > 0) {
        return res.status(400).json({ error: 'La cédula ingresada ya está registrada para otro representante.' })
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO representante (nombre_completo, cedula, telefono, tipo_relacion, direccion_id)
       VALUES (?, ?, ?, ?, ?)`,
      [finalNombreCompleto, safeCedula, safeTelefono, tipo_relacion || 'representante', safeDireccionId]
    )

    res.status(201).json({
      message: 'Representante registrado exitosamente',
      id: result.insertId,
      tutor_id: result.insertId,
      representante_id: result.insertId
    })
  } catch (error) {
    console.error('Error creando representante:', error)
    res.status(500).json({ error: 'Error al crear representante' })
  }
}

const updateTutor = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre_completo, nombres, apellidos, cedula, telefono, correo, direccion, tipo_relacion } = req.body

    let finalDireccionId
    if (direccion) {
      finalDireccionId = await addressService.findOrCreateAddress(direccion)
    } else {
      const [existing] = await pool.execute('SELECT direccion_id FROM representante WHERE representante_id = ?', [id])
      finalDireccionId = existing.length > 0 ? existing[0].direccion_id : null
    }

    const finalNombreCompleto = nombre_completo || `${nombres || ''} ${apellidos || ''}`.trim()
    const safeCedula = cedula || 'S/N'
    const safeTelefono = telefono || 'S/N'

    if (safeCedula !== 'S/N') {
      const [existingRep] = await pool.execute('SELECT representante_id FROM representante WHERE cedula = ? AND representante_id != ?', [safeCedula, id])
      if (existingRep.length > 0) {
        return res.status(400).json({ error: 'La cédula ingresada ya está registrada para otro representante.' })
      }
    }

    const [result] = await pool.execute(
      `UPDATE representante
       SET nombre_completo = ?, cedula = ?, telefono = ?, direccion_id = ?, tipo_relacion = ?
       WHERE representante_id = ?`,
      [finalNombreCompleto, safeCedula, safeTelefono, finalDireccionId, tipo_relacion || 'representante', id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Representante no encontrado' })
    }

    res.json({ message: 'Representante actualizado exitosamente' })
  } catch (error) {
    console.error('Error actualizando representante:', error)
    res.status(500).json({ error: 'Error al actualizar representante' })
  }
}

const deleteTutor = async (req, res) => {
  try {
    const { id } = req.params

    const [atletas] = await pool.execute(
      'SELECT COUNT(*) as total FROM atletas WHERE representante_id = ?',
      [id]
    )

    if (atletas[0].total > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el representante porque tiene atletas asociados'
      })
    }

    const [result] = await pool.execute(
      'DELETE FROM representante WHERE representante_id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Representante no encontrado' })
    }

    res.json({ message: 'Representante eliminado exitosamente' })
  } catch (error) {
    console.error('Error eliminando representante:', error)
    res.status(500).json({ error: 'Error al eliminar representante' })
  }
}

module.exports = {
  getTutores,
  getTutorById,
  createTutor,
  updateTutor,
  deleteTutor
}
