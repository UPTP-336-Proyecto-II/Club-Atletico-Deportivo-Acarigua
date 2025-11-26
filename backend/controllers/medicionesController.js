const pool = require('../config/database');

// Obtener todas las mediciones
const getMediciones = async (req, res) => {
  try {
    const { atleta_id } = req.query;
    
    let query = `
      SELECT m.*, 
             atl.nombre as atleta_nombre, 
             atl.apellido as atleta_apellido,
             atl.categoria as atleta_categoria,
             TIMESTAMPDIFF(YEAR, atl.fecha_nacimiento, CURDATE()) as edad,
             u.nombre as usuario_nombre
      FROM mediciones_antropometricas m
      LEFT JOIN atletas atl ON m.atleta_id = atl.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (atleta_id) {
      query += ' AND m.atleta_id = ?';
      params.push(atleta_id);
    }

    query += ' ORDER BY m.fecha_medicion DESC, atl.nombre ASC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo mediciones:', error);
    res.status(500).json({ error: 'Error al obtener mediciones' });
  }
};

// Obtener mediciones por atleta
const getMedicionesByAtleta = async (req, res) => {
  try {
    const { atleta_id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT m.*, 
              TIMESTAMPDIFF(YEAR, atl.fecha_nacimiento, CURDATE()) as edad
       FROM mediciones_antropometricas m
       LEFT JOIN atletas atl ON m.atleta_id = atl.id
       WHERE m.atleta_id = ? AND atl.activo = true
       ORDER BY m.fecha_medicion DESC`,
      [atleta_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo mediciones por atleta:', error);
    res.status(500).json({ error: 'Error al obtener mediciones' });
  }
};

// Crear medición
const createMedicion = async (req, res) => {
  try {
    const { 
      atleta_id, 
      fecha_medicion, 
      peso, 
      altura, 
      imc, 
      porcentaje_grasa, 
      masa_muscular, 
      circunferencia_cintura, 
      circunferencia_cadera, 
      observaciones, 
      usuario_id 
    } = req.body;

    // Calcular IMC si no se proporciona
    let calculatedIMC = imc;
    if (!imc && peso && altura) {
      const alturaMetros = altura / 100;
      calculatedIMC = (peso / (alturaMetros * alturaMetros)).toFixed(2);
    }

    const [result] = await pool.execute(
      `INSERT INTO mediciones_antropometricas 
       (atleta_id, fecha_medicion, peso, altura, imc, porcentaje_grasa, masa_muscular, 
        circunferencia_cintura, circunferencia_cadera, observaciones, usuario_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [atleta_id, fecha_medicion, peso, altura, calculatedIMC, porcentaje_grasa, 
       masa_muscular, circunferencia_cintura, circunferencia_cadera, observaciones, usuario_id]
    );

    res.status(201).json({ 
      message: 'Medición registrada exitosamente', 
      id: result.insertId,
      imc_calculado: calculatedIMC
    });

  } catch (error) {
    console.error('Error registrando medición:', error);
    res.status(500).json({ error: 'Error al registrar medición' });
  }
};

// Obtener última medición de un atleta
const getUltimaMedicion = async (req, res) => {
  try {
    const { atleta_id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT m.*
       FROM mediciones_antropometricas m
       WHERE m.atleta_id = ?
       ORDER BY m.fecha_medicion DESC
       LIMIT 1`,
      [atleta_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron mediciones para este atleta' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo última medición:', error);
    res.status(500).json({ error: 'Error al obtener medición' });
  }
};

// Obtener evolución de peso de un atleta
const getEvolucionPeso = async (req, res) => {
  try {
    const { atleta_id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT fecha_medicion, peso, imc
       FROM mediciones_antropometricas 
       WHERE atleta_id = ? AND peso IS NOT NULL
       ORDER BY fecha_medicion ASC`,
      [atleta_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo evolución de peso:', error);
    res.status(500).json({ error: 'Error al obtener evolución' });
  }
};

module.exports = {
  getMediciones,
  getMedicionesByAtleta,
  createMedicion,
  getUltimaMedicion,
  getEvolucionPeso
};