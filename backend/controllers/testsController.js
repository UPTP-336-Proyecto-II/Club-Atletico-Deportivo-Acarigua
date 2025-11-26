const pool = require('../config/database');

// Obtener todos los tests
const getTests = async (req, res) => {
  try {
    const { atleta_id, tipo_test } = req.query;
    
    let query = `
      SELECT t.*, 
             atl.nombre as atleta_nombre, 
             atl.apellido as atleta_apellido,
             atl.categoria as atleta_categoria,
             TIMESTAMPDIFF(YEAR, atl.fecha_nacimiento, CURDATE()) as edad,
             u.nombre as usuario_nombre
      FROM tests_rendimiento t
      LEFT JOIN atletas atl ON t.atleta_id = atl.id
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (atleta_id) {
      query += ' AND t.atleta_id = ?';
      params.push(atleta_id);
    }

    if (tipo_test) {
      query += ' AND t.tipo_test = ?';
      params.push(tipo_test);
    }

    query += ' ORDER BY t.fecha_test DESC, atl.nombre ASC';

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
       FROM tests_rendimiento t
       LEFT JOIN atletas atl ON t.atleta_id = atl.id
       WHERE t.atleta_id = ? AND atl.activo = true
       ORDER BY t.fecha_test DESC, t.tipo_test ASC`,
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
      tipo_test, 
      nombre_test, 
      resultado, 
      valor, 
      unidad, 
      observaciones, 
      usuario_id 
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO tests_rendimiento 
       (atleta_id, fecha_test, tipo_test, nombre_test, resultado, valor, unidad, observaciones, usuario_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [atleta_id, fecha_test, tipo_test, nombre_test, resultado, valor, unidad, observaciones, usuario_id]
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

// Obtener estadísticas de tests por tipo
const getEstadisticasTests = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        tipo_test,
        COUNT(*) as total_tests,
        AVG(valor) as promedio_valor,
        MIN(valor) as minimo_valor,
        MAX(valor) as maximo_valor
       FROM tests_rendimiento 
       WHERE valor IS NOT NULL
       GROUP BY tipo_test
       ORDER BY tipo_test`
    );

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Obtener evolución de un test específico para un atleta
const getEvolucionTest = async (req, res) => {
  try {
    const { atleta_id, tipo_test } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT fecha_test, valor, unidad, resultado
       FROM tests_rendimiento 
       WHERE atleta_id = ? AND tipo_test = ? AND valor IS NOT NULL
       ORDER BY fecha_test ASC`,
      [atleta_id, tipo_test]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo evolución de test:', error);
    res.status(500).json({ error: 'Error al obtener evolución' });
  }
};

module.exports = {
  getTests,
  getTestsByAtleta,
  createTest,
  getEstadisticasTests,
  getEvolucionTest
};