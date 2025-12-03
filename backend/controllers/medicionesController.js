const pool = require('../config/database');

// Obtener todas las mediciones
const getMediciones = async (req, res) => {
  try {
    const { atleta_id } = req.query;

    let query = `
      SELECT m.*, 
             atl.NOMBRE as atleta_nombre, 
             atl.APELLIDO as atleta_apellido,
             c.NOMBRE_CATEGORIA as categoria_nombre,
             TIMESTAMPDIFF(YEAR, atl.FECHA_NACIMIENTO, CURDATE()) as edad
      FROM medidas_antropometricas m
      LEFT JOIN atletas atl ON m.ATLETA_ID = atl.ATLETA_ID
      LEFT JOIN categoria c ON atl.CATEGORIA_ID = c.CATEGORIA_ID
      WHERE 1=1
    `;
    const params = [];

    if (atleta_id) {
      query += ' AND m.ATLETA_ID = ?';
      params.push(atleta_id);
    }

    query += ' ORDER BY m.FECHA_MEDICION DESC, atl.NOMBRE ASC';

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
              TIMESTAMPDIFF(YEAR, atl.FECHA_NACIMIENTO, CURDATE()) as edad
       FROM medidas_antropometricas m
       LEFT JOIN atletas atl ON m.ATLETA_ID = atl.ATLETA_ID
       WHERE m.ATLETA_ID = ? AND atl.ESTATUS IN ('ACTIVO', 'LESIONADO')
       ORDER BY m.FECHA_MEDICION DESC`,
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
      indice_de_masa,
      envergadura,
      largo_de_pierna,
      largo_de_torso
    } = req.body;

    // Calcular IMC si no se proporciona
    let calculatedIMC = indice_de_masa;
    if (!indice_de_masa && peso && altura) {
      const alturaMetros = altura / 100;
      calculatedIMC = (peso / (alturaMetros * alturaMetros)).toFixed(2);
    }

    const [result] = await pool.execute(
      `INSERT INTO medidas_antropometricas 
       (ATLETA_ID, FECHA_MEDICION, PESO, ALTURA, INDICE_DE_MASA, ENVERGADURA, LARGO_DE_PIERNA, LARGO_DE_TORSO) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [atleta_id, fecha_medicion, peso, altura, calculatedIMC, envergadura, largo_de_pierna, largo_de_torso]
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
       FROM medidas_antropometricas m
       WHERE m.ATLETA_ID = ?
       ORDER BY m.FECHA_MEDICION DESC
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
      `SELECT FECHA_MEDICION, PESO, INDICE_DE_MASA
       FROM medidas_antropometricas 
       WHERE ATLETA_ID = ? AND PESO IS NOT NULL
       ORDER BY FECHA_MEDICION ASC`,
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