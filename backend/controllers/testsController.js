const pool = require('../config/database');

// Obtener todos los tests
const getTests = async (req, res) => {
  try {
    const { atleta_id } = req.query;

    let query = `
      SELECT t.*, 
             atl.NOMBRE as atleta_nombre, 
             atl.APELLIDO as atleta_apellido,
             c.NOMBRE_CATEGORIA as categoria_nombre,
             TIMESTAMPDIFF(YEAR, atl.FECHA_NACIMIENTO, CURDATE()) as edad
      FROM test_de_rendimiento t
      LEFT JOIN atletas atl ON t.ATLETA_ID = atl.ATLETA_ID
      LEFT JOIN categoria c ON atl.CATEGORIA_ID = c.CATEGORIA_ID
      WHERE 1=1
    `;
    const params = [];

    if (atleta_id) {
      query += ' AND t.ATLETA_ID = ?';
      params.push(atleta_id);
    }

    query += ' ORDER BY t.FECHA_TEST DESC, atl.NOMBRE ASC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tests:', error);
    res.status(500).json({ error: 'Error al obtener tests' });
  }
};

// Obtener tests por atleta
const getTestsByAtleta = async (req, res) => {
  try {
    const { atleta_id } = req.params;

    const [rows] = await pool.execute(
      `SELECT t.*
       FROM test_de_rendimiento t
       LEFT JOIN atletas atl ON t.ATLETA_ID = atl.ATLETA_ID
       WHERE t.ATLETA_ID = ? AND atl.ESTATUS IN ('ACTIVO', 'LESIONADO')
       ORDER BY t.FECHA_TEST DESC`,
      [atleta_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tests por atleta:', error);
    res.status(500).json({ error: 'Error al obtener tests' });
  }
};

// Crear test
const createTest = async (req, res) => {
  try {
    const {
      atleta_id,
      fecha_test,
      test_de_fuerza,
      test_resistencia,
      test_velocidad,
      test_coordinacion,
      test_de_reaccion
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO test_de_rendimiento 
       (ATLETA_ID, FECHA_TEST, TEST_DE_FUERZA, TEST_RESISTENCIA, TEST_VELOCIDAD, TEST_COORDINACION, TEST_DE_REACCION) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [atleta_id, fecha_test, test_de_fuerza, test_resistencia, test_velocidad, test_coordinacion, test_de_reaccion]
    );

    res.status(201).json({
      message: 'Test registrado exitosamente',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error registrando test:', error);
    res.status(500).json({ error: 'Error al registrar test' });
  }
};

// Obtener estadísticas de tests
const getEstadisticasTests = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total_tests,
        AVG(TEST_DE_FUERZA) as promedio_fuerza,
        AVG(TEST_RESISTENCIA) as promedio_resistencia,
        AVG(TEST_VELOCIDAD) as promedio_velocidad,
        AVG(TEST_COORDINACION) as promedio_coordinacion,
        AVG(TEST_DE_REACCION) as promedio_reaccion
       FROM test_de_rendimiento`
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Obtener evolución de tests para un atleta
const getEvolucionTest = async (req, res) => {
  try {
    const { atleta_id } = req.params;

    const [rows] = await pool.execute(
      `SELECT FECHA_TEST, TEST_DE_FUERZA, TEST_RESISTENCIA, TEST_VELOCIDAD, TEST_COORDINACION, TEST_DE_REACCION
       FROM test_de_rendimiento 
       WHERE ATLETA_ID = ?
       ORDER BY FECHA_TEST ASC`,
      [atleta_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo evolución de test:', error);
    res.status(500).json({ error: 'Error al obtener evolución' });
  }
};

// Obtener último test de un atleta
const getUltimoTest = async (req, res) => {
  try {
    const { atleta_id } = req.params;

    const [rows] = await pool.execute(
      `SELECT *
       FROM test_de_rendimiento 
       WHERE ATLETA_ID = ?
       ORDER BY FECHA_TEST DESC
       LIMIT 1`,
      [atleta_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron tests para este atleta' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo último test:', error);
    res.status(500).json({ error: 'Error al obtener test' });
  }
};

module.exports = {
  getTests,
  getTestsByAtleta,
  createTest,
  getEstadisticasTests,
  getEvolucionTest,
  getUltimoTest
};