const pool = require('../config/database');

const getAtletas = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, 
              TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) as edad
       FROM atletas a 
       WHERE a.activo = true 
       ORDER BY a.created_at DESC`
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
              TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) as edad
       FROM atletas a 
       WHERE a.id = ? AND a.activo = true`,
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
      cedula, 
      nombre, 
      apellido, 
      fecha_nacimiento, 
      genero, 
      categoria, 
      telefono, 
      email, 
      direccion,
      observaciones_medicas 
    } = req.body;

    // Verificar si la cédula ya existe
    const [existing] = await pool.execute(
      'SELECT id FROM atletas WHERE cedula = ?',
      [cedula]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'La cédula ya está registrada' });
    }

    const [result] = await pool.execute(
      `INSERT INTO atletas 
       (cedula, nombre, apellido, fecha_nacimiento, genero, categoria, telefono, email, direccion, observaciones_medicas, fecha_ingreso) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [cedula, nombre, apellido, fecha_nacimiento, genero, categoria, telefono, email, direccion, observaciones_medicas]
    );

    res.status(201).json({ 
      message: 'Atleta creado exitosamente', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('Error creando atleta:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'La cédula ya está registrada' });
    }
    
    res.status(500).json({ error: 'Error al crear atleta' });
  }
};

const updateAtleta = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, apellido, fecha_nacimiento, genero, categoria, 
      telefono, email, direccion, observaciones_medicas 
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE atletas 
       SET nombre = ?, apellido = ?, fecha_nacimiento = ?, genero = ?, categoria = ?,
           telefono = ?, email = ?, direccion = ?, observaciones_medicas = ?
       WHERE id = ?`,
      [nombre, apellido, fecha_nacimiento, genero, categoria, 
       telefono, email, direccion, observaciones_medicas, id]
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
      'UPDATE atletas SET activo = false WHERE id = ?',
      [id]
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