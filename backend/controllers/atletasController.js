const pool = require('../config/database');

const getAtletas = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, 
              TIMESTAMPDIFF(YEAR, a.FECHA_NACIMIENTO, CURDATE()) as edad,
              c.NOMBRE_CATEGORIA as categoria_nombre,
              t.NOMBRE_COMPLETO as tutor_nombre
       FROM atletas a 
       LEFT JOIN categoria c ON a.CATEGORIA_ID = c.CATEGORIA_ID
       LEFT JOIN tutor t ON a.TUTOR_ID = t.TUTOR_ID
       WHERE a.ESTATUS IN ('ACTIVO', 'LESIONADO')
       ORDER BY a.CREATED_AT DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo atletas:', error);
    res.status(500).json({ error: 'Error al obtener atletas' });
  }
};

const getAtletaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT a.*, 
              TIMESTAMPDIFF(YEAR, a.FECHA_NACIMIENTO, CURDATE()) as edad,
              c.NOMBRE_CATEGORIA as categoria_nombre,
              t.NOMBRE_COMPLETO as tutor_nombre,
              t.TELEFONO as tutor_telefono
       FROM atletas a 
       LEFT JOIN categoria c ON a.CATEGORIA_ID = c.CATEGORIA_ID
       LEFT JOIN tutor t ON a.TUTOR_ID = t.TUTOR_ID
       WHERE a.ATLETA_ID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Atleta no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo atleta:', error);
    res.status(500).json({ error: 'Error al obtener atleta' });
  }
};

const createAtleta = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      direccion,
      fecha_nacimiento,
      posicion_de_juego,
      categoria_id,
      tutor_id,
      estatus
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO atletas 
       (NOMBRE, APELLIDO, TELEFONO, DIRECCION, FECHA_NACIMIENTO, POSICION_DE_JUEGO, CATEGORIA_ID, TUTOR_ID, ESTATUS) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, telefono, direccion, fecha_nacimiento, posicion_de_juego, categoria_id, tutor_id, estatus || 'ACTIVO']
    );

    res.status(201).json({
      message: 'Atleta creado exitosamente',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error creando atleta:', error);
    res.status(500).json({ error: 'Error al crear atleta' });
  }
};

const updateAtleta = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      telefono,
      direccion,
      fecha_nacimiento,
      posicion_de_juego,
      categoria_id,
      tutor_id,
      estatus
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE atletas 
       SET NOMBRE = ?, APELLIDO = ?, TELEFONO = ?, DIRECCION = ?, FECHA_NACIMIENTO = ?, 
           POSICION_DE_JUEGO = ?, CATEGORIA_ID = ?, TUTOR_ID = ?, ESTATUS = ?
       WHERE ATLETA_ID = ?`,
      [nombre, apellido, telefono, direccion, fecha_nacimiento, posicion_de_juego, categoria_id, tutor_id, estatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Atleta no encontrado' });
    }

    res.json({ message: 'Atleta actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando atleta:', error);
    res.status(500).json({ error: 'Error al actualizar atleta' });
  }
};

const deleteAtleta = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE atletas SET ESTATUS = ? WHERE ATLETA_ID = ?',
      ['INACTIVO', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Atleta no encontrado' });
    }

    res.json({ message: 'Atleta eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando atleta:', error);
    res.status(500).json({ error: 'Error al eliminar atleta' });
  }
};

module.exports = {
  getAtletas,
  getAtletaById,
  createAtleta,
  updateAtleta,
  deleteAtleta
};