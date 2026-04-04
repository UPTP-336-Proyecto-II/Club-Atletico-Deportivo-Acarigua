const pool = require('../config/database')
const addressService = require('../services/addressService')

// Estatus mapping: tinyint <-> string
const ESTATUS_MAP = { 0: 'SUSPENDIDO', 1: 'ACTIVO', 2: 'LESIONADO', 3: 'INACTIVO' }
const ESTATUS_REVERSE = { 'SUSPENDIDO': 0, 'ACTIVO': 1, 'LESIONADO': 2, 'INACTIVO': 3 }

function mapEstatusToString(val) {
  if (typeof val === 'number' || /^\d+$/.test(String(val || ''))) {
    return ESTATUS_MAP[Number(val)] || 'ACTIVO'
  }
  return String(val || 'ACTIVO').toUpperCase()
}

function mapEstatusToInt(val) {
  if (typeof val === 'number') return val
  const normalized = String(val || 'ACTIVO').toUpperCase()
  return ESTATUS_REVERSE[normalized] !== undefined ? ESTATUS_REVERSE[normalized] : 1
}

async function resolveLegacyRepresentanteId(requestedTutorId, fallbackDireccionId) {
  if (requestedTutorId) {
    return requestedTutorId;
  }

  const [existingRepresentantes] = await pool.execute(
    'SELECT representante_id FROM representante ORDER BY representante_id ASC LIMIT 1'
  );

  if (existingRepresentantes.length > 0) {
    return existingRepresentantes[0].representante_id;
  }

  let direccionId = fallbackDireccionId;
  if (!direccionId) {
    const [dirRes] = await pool.execute(
      'INSERT INTO direcciones (parroquias_id, localidad, tipo_vivienda, `ubicación vivienda`) VALUES (?, ?, ?, ?)',
      [0, '', '', '']
    );
    direccionId = dirRes.insertId;
  }

  const tempCedula = `TMP${Date.now().toString().slice(-8)}`;
  const [representanteRes] = await pool.execute(
    `INSERT INTO representante
     (nombre_completo, telefono, cedula, tipo_relacion, direccion_id, foto)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['Sin representante', '00000000000', tempCedula, 'representante', direccionId, null]
  );

  return representanteRes.insertId;
}

const getAtletas = async (req, res) => {
  try {
    const { search, cedula, sin_cedula, categoria_id, estatus, order } = req.query

    let query = `SELECT a.*,
                    TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) as edad,
                    c.nombre_categoria as categoria_nombre,
                    r.nombre_completo as tutor_nombre,
                    ${addressService.getSelectColumns().replace(/d\./g, 'd.').replace(/e\./g, 'e.').replace(/m\./g, 'm.').replace(/p\./g, 'p.')},
                    pj.nombre_posicion as posicion_de_juego_nombre
             FROM atletas a
             LEFT JOIN categoria c ON a.categoria_id = c.categoria_id
             LEFT JOIN representante r ON a.representante_id = r.representante_id
             LEFT JOIN posicion_juego pj ON a.posicion_de_juego = pj.posicion_id
             ${addressService.getJoins().replace('entity.direccion_id', 'a.direccion_id')}
             WHERE 1=1`

    const params = []

    if (search) {
      query += ' AND (a.nombre LIKE ? OR a.apellido LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    if (cedula) {
      query += ' AND a.cedula LIKE ?'
      params.push(`%${cedula}%`)
    }

    if (sin_cedula === 'true') {
      query += " AND (a.cedula IS NULL OR a.cedula = '')"
    }

    if (req.query.con_cedula === 'true') {
      query += " AND a.cedula IS NOT NULL AND a.cedula != ''"
    }

    if (categoria_id) {
      query += ' AND a.categoria_id = ?'
      params.push(categoria_id)
    }

    if (estatus && estatus !== 'TODOS') {
      const estatusInt = mapEstatusToInt(estatus)
      query += ' AND a.estatus = ?'
      params.push(estatusInt)
    } else if (!estatus) {
      // Default: show ACTIVO (1) and LESIONADO (2)
      query += ' AND a.estatus IN (1, 2)'
    }

    switch (order) {
      case 'oldest':
        query += ' ORDER BY a.created_at ASC'
        break
      case 'name_asc':
        query += ' ORDER BY a.nombre ASC, a.apellido ASC'
        break
      case 'name_desc':
        query += ' ORDER BY a.nombre DESC, a.apellido DESC'
        break
      default:
        query += ' ORDER BY a.created_at DESC'
    }

    const [rows] = await pool.execute(query, params)

    // Map estatus tinyint to string for frontend
    const mapped = rows.map(row => ({
      ...row,
      estatus: mapEstatusToString(row.estatus)
    }))

    res.json(mapped)
  } catch (error) {
    console.error('Error obteniendo atletas:', error)
    res.status(500).json({ error: 'Error al obtener atletas', details: error.message })
  }
}

const getAtletaById = async (req, res) => {
  try {
    const { id } = req.params

    const [rows] = await pool.execute(
      `SELECT a.*,
              TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) as edad,
              c.nombre_categoria as categoria_nombre,
              r.nombre_completo as tutor_nombre,
              r.telefono as tutor_telefono,
              ${addressService.getSelectColumns().replace(/d\./g, 'd.').replace(/e\./g, 'e.').replace(/m\./g, 'm.').replace(/p\./g, 'p.')},
              pj.nombre_posicion as posicion_de_juego_nombre
       FROM atletas a
       LEFT JOIN categoria c ON a.categoria_id = c.categoria_id
       LEFT JOIN representante r ON a.representante_id = r.representante_id
       LEFT JOIN posicion_juego pj ON a.posicion_de_juego = pj.posicion_id
       ${addressService.getJoins().replace('entity.direccion_id', 'a.direccion_id')}
       WHERE a.atleta_id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Atleta no encontrado' })
    }

    const atleta = {
      ...rows[0],
      estatus: mapEstatusToString(rows[0].estatus)
    }

    res.json(atleta)
  } catch (error) {
    console.error('Error obteniendo atleta:', error)
    res.status(500).json({ error: 'Error al obtener atleta' })
  }
}

const createAtleta = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      cedula,
      telefono,
      direccion,
      representante,
      fecha_nacimiento,
      sexo,
      posicion_de_juego,
      pierna_dominante,
      categoria_id,
      representante_id,
      tutor_id,
      estatus,
      foto
    } = req.body

    if (cedula && cedula.trim() !== '') {
      const [existingAtleta] = await pool.execute('SELECT atleta_id FROM atletas WHERE cedula = ?', [cedula.trim()])
      if (existingAtleta.length > 0) {
        return res.status(400).json({ error: 'La cédula ingresada ya está registrada para otro atleta.' })
      }
    }
    let direccion_id = null
    if (direccion && (direccion.estado || direccion.municipio || direccion.parroquia || direccion.descripcion_descriptiva)) {
      direccion_id = await addressService.findOrCreateAddress(direccion)
    }

    let finalRepresentanteId = representante_id || tutor_id

    // If representative data provided from multi-step form
    const repData = representante || req.body.tutor
    if (repData && (repData.nombre || repData.nombres || repData.nombre_completo)) {
      const nombreCompleto = repData.nombre_completo || `${repData.nombre || repData.nombres || ''} ${repData.apellido || repData.apellidos || ''}`.trim()
      let tipo_relacion = (repData.tipo_relacion || 'representante').toLowerCase()

      const validRel = ['abuelo/a', 'padres', 'tio/a', 'hermano/a', 'primo/a', 'representante']
      if (!validRel.includes(tipo_relacion)) { tipo_relacion = 'representante' }

      const safeRepCedula = repData.cedula || 'S/N'
      const safeRepTelefono = repData.telefono || 'S/N'

      if (safeRepCedula !== 'S/N') {
        const [existingRep] = await pool.execute('SELECT representante_id FROM representante WHERE cedula = ?', [safeRepCedula])
        if (existingRep.length > 0) {
          return res.status(400).json({ error: 'La cédula ingresada ya está registrada para otro representante.' })
        }
      }

      const [repRes] = await pool.execute(
        `INSERT INTO representante (nombre_completo, cedula, telefono, tipo_relacion, direccion_id) VALUES (?, ?, ?, ?, ?)`,
        [nombreCompleto, safeRepCedula, safeRepTelefono, tipo_relacion, direccion_id || 1]
      )
      finalRepresentanteId = repRes.insertId
    } else if (!finalRepresentanteId) {
      // Self-represented adult athlete
      const nombreCompleto = `${nombre} ${apellido}`.trim()
      const safeCedula = cedula || 'S/N'
      const safeTelefono = telefono || 'S/N'
      const safeDireccionId = direccion_id || 1 // Fallback since direccion_id in representante is NOT NULL
      const [repRes] = await pool.execute(
        `INSERT INTO representante (nombre_completo, cedula, telefono, tipo_relacion, direccion_id) VALUES (?, ?, ?, 'representante', ?)`,
        [nombreCompleto, safeCedula, safeTelefono, safeDireccionId]
      )
      finalRepresentanteId = repRes.insertId
    }

    const safeEstatus = mapEstatusToInt(estatus)
    const safePierna = (pierna_dominante || 'derecha').toLowerCase()
    const sexoValue = (sexo && ['M', 'F'].includes(sexo.toUpperCase().charAt(0))) ? sexo.toUpperCase().charAt(0) : 'M'

    const [result] = await pool.execute(
      `INSERT INTO atletas
        (nombre, apellido, cedula, telefono, direccion_id, fecha_nacimiento, sexo, posicion_de_juego, pierna_dominante, categoria_id, representante_id, estatus, foto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, cedula || null, telefono || null, direccion_id, fecha_nacimiento, sexoValue, posicion_de_juego || null, safePierna, categoria_id || null, finalRepresentanteId, safeEstatus, foto || null]
    )

    res.status(201).json({
      message: 'Atleta creado exitosamente',
      id: result.insertId
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un atleta (o representante) con la cédula ingresada en el sistema.' })
    }
    console.error('Error creando atleta:', error)
    res.status(500).json({ error: 'Error al crear atleta', details: error.message })
  }
}

const updateAtleta = async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      apellido,
      telefono,
      direccion,
      representante,
      fecha_nacimiento,
      sexo,
      posicion_de_juego,
      pierna_dominante,
      categoria_id,
      representante_id,
      tutor_id,
      estatus,
      foto,
      cedula
    } = req.body

    let finalDireccionId = undefined
    if (direccion && (direccion.estado || direccion.municipio || direccion.parroquia || direccion.descripcion_descriptiva)) {
      finalDireccionId = await addressService.findOrCreateAddress(direccion)
    } else {
      const [existing] = await pool.execute('SELECT direccion_id FROM atletas WHERE atleta_id = ?', [id])
      if (existing.length > 0) finalDireccionId = existing[0].direccion_id
    }

    let finalRepresentanteId = representante_id || tutor_id

    const repData = representante || req.body.tutor
    if (repData && (repData.nombre || repData.nombres || repData.nombre_completo)) {
      const nombreCompleto = repData.nombre_completo || `${repData.nombre || repData.nombres || ''} ${repData.apellido || repData.apellidos || ''}`.trim()
      let tipo_relacion = (repData.tipo_relacion || 'representante').toLowerCase()

      const validRel = ['abuelo/a', 'padres', 'tio/a', 'hermano/a', 'primo/a', 'representante']
      if (!validRel.includes(tipo_relacion)) { tipo_relacion = 'representante' }

      if (!finalRepresentanteId) {
        const [existing] = await pool.execute('SELECT representante_id FROM atletas WHERE atleta_id = ?', [id])
        if (existing.length > 0) finalRepresentanteId = existing[0].representante_id
      }

      if (finalRepresentanteId) {
        const safeRepCedula = repData.cedula || 'S/N'
        const safeRepTelefono = repData.telefono || 'S/N'

        if (safeRepCedula !== 'S/N') {
          const [existingRep] = await pool.execute('SELECT representante_id FROM representante WHERE cedula = ? AND representante_id != ?', [safeRepCedula, finalRepresentanteId])
          if (existingRep.length > 0) {
            return res.status(400).json({ error: 'La cédula ingresada ya está registrada para otro representante.' })
          }
        }

        await pool.execute(
          `UPDATE representante SET nombre_completo = ?, cedula = ?, telefono = ?, tipo_relacion = ?, direccion_id = ? WHERE representante_id = ?`,
          [nombreCompleto, safeRepCedula, safeRepTelefono, tipo_relacion, finalDireccionId, finalRepresentanteId]
        )
      } else {
        const safeRepCedula = repData.cedula || 'S/N'
        const safeRepTelefono = repData.telefono || 'S/N'
        const safeDireccionId = finalDireccionId || 1

        if (safeRepCedula !== 'S/N') {
          const [existingRep] = await pool.execute('SELECT representante_id FROM representante WHERE cedula = ?', [safeRepCedula])
          if (existingRep.length > 0) {
            return res.status(400).json({ error: 'La cédula ingresada ya está registrada para otro representante.' })
          }
        }

        const [repRes] = await pool.execute(
          `INSERT INTO representante (nombre_completo, cedula, telefono, tipo_relacion, direccion_id) VALUES (?, ?, ?, ?, ?)`,
          [nombreCompleto, safeRepCedula, safeRepTelefono, tipo_relacion, safeDireccionId]
        )
        finalRepresentanteId = repRes.insertId
      }
    } else {
      if (!finalRepresentanteId) {
        const [existing] = await pool.execute('SELECT representante_id FROM atletas WHERE atleta_id = ?', [id])
        if (existing.length > 0 && existing[0].representante_id) finalRepresentanteId = existing[0].representante_id
      }

      if (!finalRepresentanteId) {
        const nombreCompleto = `${nombre || ''} ${apellido || ''}`.trim()
        const safeCedula = cedula || 'S/N'
        const safeTelefono = telefono || 'S/N'
        const safeDireccionId = finalDireccionId || 1 // Fallback since direccion_id in representante is NOT NULL
        const [repRes] = await pool.execute(
          `INSERT INTO representante (nombre_completo, cedula, telefono, tipo_relacion, direccion_id) VALUES (?, ?, ?, 'representante', ?)`,
          [nombreCompleto, safeCedula, safeTelefono, safeDireccionId]
        )
        finalRepresentanteId = repRes.insertId
      }
    }

    const safeEstatus = mapEstatusToInt(estatus)
    const sexoValue = (sexo && ['M', 'F'].includes(sexo.toUpperCase().charAt(0))) ? sexo.toUpperCase().charAt(0) : undefined

    // Build update dynamically to only update provided fields
    const updates = []
    const params = []

    if (nombre !== undefined) { updates.push('nombre = ?'); params.push(nombre) }
    if (apellido !== undefined) { updates.push('apellido = ?'); params.push(apellido) }
    if (cedula !== undefined) { updates.push('cedula = ?'); params.push(cedula || null) }
    if (telefono !== undefined) { updates.push('telefono = ?'); params.push(telefono || null) }
    if (finalDireccionId !== undefined) { updates.push('direccion_id = ?'); params.push(finalDireccionId) }
    if (fecha_nacimiento !== undefined) { updates.push('fecha_nacimiento = ?'); params.push(fecha_nacimiento) }
    if (sexoValue) { updates.push('sexo = ?'); params.push(sexoValue) }
    if (posicion_de_juego !== undefined) { updates.push('posicion_de_juego = ?'); params.push(posicion_de_juego || null) }
    if (pierna_dominante !== undefined) { updates.push('pierna_dominante = ?'); params.push((pierna_dominante || 'derecha').toLowerCase()) }
    if (categoria_id !== undefined) { updates.push('categoria_id = ?'); params.push(categoria_id || null) }
    if (finalRepresentanteId) { updates.push('representante_id = ?'); params.push(finalRepresentanteId) }
    if (estatus !== undefined) { updates.push('estatus = ?'); params.push(safeEstatus) }
    if (foto !== undefined) { updates.push('foto = ?'); params.push(foto || null) }

    if (updates.length === 0) {
      return res.json({ message: 'No hay campos para actualizar' })
    }

    params.push(id)
    const query = `UPDATE atletas SET ${updates.join(', ')} WHERE atleta_id = ?`
    await pool.execute(query, params)

    res.json({ message: 'Atleta actualizado exitosamente' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'La cédula ingresada ya está registrada en el sistema.' })
    }
    console.error('Error actualizando atleta:', error)
    res.status(500).json({ error: 'Error al actualizar atleta', details: error.message })
  }
}

const deleteAtleta = async (req, res) => {
  try {
    const { id } = req.params

    // Get the athlete's representante_id before deleting
    const [atletaRows] = await pool.execute('SELECT representante_id FROM atletas WHERE atleta_id = ?', [id])
    if (atletaRows.length === 0) {
      return res.status(404).json({ error: 'Atleta no encontrado' })
    }
    const representanteId = atletaRows[0].representante_id

    // Delete all child records first (ON DELETE NO ACTION requires manual cleanup)
    await pool.execute('DELETE FROM asistencias WHERE atleta_id = ?', [id])
    await pool.execute('DELETE FROM atencion_medica WHERE atleta_id = ?', [id])
    await pool.execute('DELETE FROM ficha_medica WHERE atleta_id = ?', [id])
    await pool.execute('DELETE FROM medidas_antropometricas WHERE atleta_id = ?', [id])
    await pool.execute('DELETE FROM resultado_pruebas WHERE atleta_id = ?', [id])

    // Delete the athlete
    await pool.execute('DELETE FROM atletas WHERE atleta_id = ?', [id])

    // Delete the associated representante if no other athlete references it
    if (representanteId) {
      const [otherAtletas] = await pool.execute(
        'SELECT atleta_id FROM atletas WHERE representante_id = ?',
        [representanteId]
      )
      if (otherAtletas.length === 0) {
        await pool.execute('DELETE FROM representante WHERE representante_id = ?', [representanteId])
      }
    }

    res.json({ message: 'Atleta y todos sus registros asociados eliminados exitosamente' })
  } catch (error) {
    console.error('Error eliminando atleta:', error)
    res.status(500).json({ error: 'Error al eliminar atleta', details: error.message })
  }
}

const updateAtletaTutor = async (req, res) => {
  try {
    const { id } = req.params
    const { tutor_id, representante_id } = req.body

    const finalId = representante_id || tutor_id

    const [result] = await pool.execute(
      'UPDATE atletas SET representante_id = ? WHERE atleta_id = ?',
      [finalId, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Atleta no encontrado' })
    }

    res.json({ message: 'Representante asignado exitosamente' })
  } catch (error) {
    console.error('Error asignando representante:', error)
    res.status(500).json({ error: 'Error al asignar representante' })
  }
}

const getAtletaTutor = async (req, res) => {
  try {
    const { id } = req.params

    const [rows] = await pool.execute(
      `SELECT r.*,
              ${addressService.getSelectColumns().replace(/d\./g, 'd.').replace(/e\./g, 'e.').replace(/m\./g, 'm.').replace(/p\./g, 'p.')}
       FROM atletas a
       JOIN representante r ON a.representante_id = r.representante_id
       ${addressService.getJoins().replace('entity.direccion_id', 'r.direccion_id')}
       WHERE a.atleta_id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'El atleta no tiene un representante asignado' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error obteniendo representante del atleta:', error)
    res.status(500).json({ error: 'Error al obtener representante' })
  }
}

const removeAtletaTutor = async (req, res) => {
  try {
    const { id } = req.params

    const [atletaRows] = await pool.execute(
      'SELECT nombre, apellido, cedula, telefono, representante_id, direccion_id FROM atletas WHERE atleta_id = ?',
      [id]
    )
    if (atletaRows.length === 0) {
      return res.status(404).json({ error: 'Atleta no encontrado' })
    }
    const atleta = atletaRows[0]
    const oldRepId = atleta.representante_id
    const atletaDireccionId = atleta.direccion_id

    const nombreCompleto = `${atleta.nombre || ''} ${atleta.apellido || ''}`.trim()
    const safeCedula = atleta.cedula || 'S/N'
    const safeTelefono = atleta.telefono || 'S/N'

    let newRepId

    // Try finding an existing self-rep record for this athlete's cedula
    if (safeCedula !== 'S/N') {
      const [existingRep] = await pool.execute(
        'SELECT representante_id FROM representante WHERE cedula = ?',
        [safeCedula]
      )
      if (existingRep.length > 0) {
        newRepId = existingRep[0].representante_id
      }
    }

    // If no existing self-rep record found, create one using the athlete's address
    if (!newRepId) {
      const [insertRes] = await pool.execute(
        `INSERT INTO representante (nombre_completo, cedula, telefono, tipo_relacion, direccion_id) VALUES (?, ?, ?, 'representante', ?)`,
        [nombreCompleto, safeCedula, safeTelefono, atletaDireccionId]
      )
      newRepId = insertRes.insertId
    }

    // Update the athlete to point to the new (or existing) self-rep record
    await pool.execute(
      'UPDATE atletas SET representante_id = ? WHERE atleta_id = ?',
      [newRepId, id]
    )

    // Cleanup the old representative if it was a third-party and is now orphaned
    if (oldRepId && oldRepId !== newRepId) {
      const [otherAtletas] = await pool.execute(
        'SELECT atleta_id FROM atletas WHERE representante_id = ?',
        [oldRepId]
      )
      if (otherAtletas.length === 0) {
        await pool.execute('DELETE FROM representante WHERE representante_id = ?', [oldRepId])
      }
    }

    res.json({ message: 'Representante eliminado correctamente' })
  } catch (error) {
    console.error('Error al remover representante:', error)
    res.status(500).json({ error: 'Error al remover representante' })
  }
}

module.exports = {
  getAtletas,
  getAtletaById,
  createAtleta,
  updateAtleta,
  updateAtletaTutor,
  getAtletaTutor,
  deleteAtleta,
  removeAtletaTutor,
  uploadFoto: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' })
      }
      res.json({
        message: 'Foto subida exitosamente',
        filename: req.file.filename,
        url: `/uploads/atletas/${req.file.filename}`
      })
    } catch (error) {
      console.error('Error en uploadFoto:', error)
      res.status(500).json({ error: 'Error al procesar la foto' })
    }
  }
}