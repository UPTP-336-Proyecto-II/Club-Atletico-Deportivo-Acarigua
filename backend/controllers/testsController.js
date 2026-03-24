const pool = require('../config/database');

// Obtener todos los tests
const getTests = async (req, res) => {
  try {
    const { atleta_id } = req.query;

    let query = `SELECT t.*, 
                DATE_FORMAT(CONCAT(a.fecha, ' ', IFNULL(a.hora_inicio, '00:00:00')), '%Y-%m-%d %H:%i:%s') as fecha_test,
                atl.nombre as atleta_nombre, 
                atl.apellido as atleta_apellido,
                c.nombre_categoria as categoria_nombre,
                TIMESTAMPDIFF(YEAR, atl.fecha_nacimiento, CURDATE()) as edad
         FROM resultado_pruebas t
         LEFT JOIN actividades a ON t.actividad_id = a.actividad_id
         LEFT JOIN atletas atl ON t.atleta_id = atl.atleta_id
         LEFT JOIN categoria c ON atl.categoria_id = c.categoria_id
         WHERE 1=1`;

    const params = [];

    if (atleta_id) {
      query += ' AND t.atleta_id = ?';
      params.push(atleta_id);
    }

    query += ' ORDER BY a.fecha DESC, t.test_id DESC, atl.nombre ASC';

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

    const query = `SELECT t.*, DATE_FORMAT(CONCAT(a.fecha, ' ', IFNULL(a.hora_inicio, '00:00:00')), '%Y-%m-%d %H:%i:%s') as fecha_test
         FROM resultado_pruebas t
         LEFT JOIN actividades a ON t.actividad_id = a.actividad_id
         LEFT JOIN atletas atl ON t.atleta_id = atl.atleta_id
         WHERE t.atleta_id = ? AND atl.estatus IN (1, 2)
         ORDER BY a.fecha DESC, t.test_id DESC`;

    const [rows] = await pool.execute(query, [atleta_id]);

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

    let result;
    // Buscar o crear actividad para la fecha y hora
    let actividadId;
    if (fecha_test) {
      const datePart = fecha_test.split(' ')[0];
      const timePart = fecha_test.split(' ')[1] || '00:00:00';

      const [actividades] = await pool.execute("SELECT actividad_id FROM actividades WHERE fecha = ? AND hora_inicio = ? AND tipo_actividad = 2", [datePart, timePart]); 
      if (actividades.length > 0) {
        actividadId = actividades[0].actividad_id;
      } else {
        const [newActividad] = await pool.execute(
          "INSERT INTO actividades (tipo_actividad, objetivo_principal, fecha, hora_inicio, estatus) VALUES (2, 'Pruebas Físicas', ?, ?, 2)",
          [datePart, timePart]
        );
        actividadId = newActividad.insertId;
      }
    }

    [result] = await pool.execute(
      `INSERT INTO resultado_pruebas 
       (actividad_id, atleta_id, test_de_fuerza, test_resistencia, test_velocidad, test_coordinacion, test_de_reaccion) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [actividadId || null, atleta_id, test_de_fuerza, test_resistencia, test_velocidad, test_coordinacion, test_de_reaccion]
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
        AVG(test_de_fuerza) as promedio_fuerza,
        AVG(test_resistencia) as promedio_resistencia,
        AVG(test_velocidad) as promedio_velocidad,
        AVG(test_coordinacion) as promedio_coordinacion,
        AVG(test_de_reaccion) as promedio_reaccion
       FROM resultado_pruebas`
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

const getEvolucionTest = async (req, res) => {
  try {
    const { atleta_id } = req.params;

    const query = `SELECT DATE_FORMAT(CONCAT(a.fecha, ' ', IFNULL(a.hora_inicio, '00:00:00')), '%Y-%m-%d %H:%i:%s') as fecha_test, t.test_de_fuerza, t.test_resistencia, t.test_velocidad, t.test_coordinacion, t.test_de_reaccion
         FROM resultado_pruebas t
         LEFT JOIN actividades a ON t.actividad_id = a.actividad_id
         WHERE t.atleta_id = ?
         ORDER BY a.fecha ASC`;

    const [rows] = await pool.execute(query, [atleta_id]);

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

    const query = `SELECT t.*, DATE_FORMAT(CONCAT(a.fecha, ' ', IFNULL(a.hora_inicio, '00:00:00')), '%Y-%m-%d %H:%i:%s') as fecha_test
         FROM resultado_pruebas t
         LEFT JOIN actividades a ON t.actividad_id = a.actividad_id 
         WHERE t.atleta_id = ?
         ORDER BY a.fecha DESC, t.test_id DESC
         LIMIT 1`;

    const [rows] = await pool.execute(query, [atleta_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron tests para este atleta' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo último test:', error);
    res.status(500).json({ error: 'Error al obtener test' });
  }
};

// Eliminar test
const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM resultado_pruebas WHERE test_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Test no encontrado' });
    }

    res.json({ message: 'Test eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando test:', error);
    res.status(500).json({ error: 'Error al eliminar test' });
  }
};

// Actualizar test
const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha_test,
      test_de_fuerza,
      test_resistencia,
      test_velocidad,
      test_coordinacion,
      test_de_reaccion
    } = req.body;

    let actividadId = null;
    if (fecha_test) {
      const datePart = fecha_test.split(' ')[0];
      const timePart = fecha_test.split(' ')[1] || '00:00:00';

      const [actividades] = await pool.execute("SELECT actividad_id FROM actividades WHERE fecha = ? AND hora_inicio = ? AND tipo_actividad = 2", [datePart, timePart]);
      if (actividades.length > 0) {
        actividadId = actividades[0].actividad_id;
      } else {
        const [newActividad] = await pool.execute(
          "INSERT INTO actividades (tipo_actividad, objetivo_principal, fecha, hora_inicio, estatus) VALUES (2, 'Pruebas Físicas', ?, ?, 2)",
          [datePart, timePart]
        );
        actividadId = newActividad.insertId;
      }
    }

    const [result] = await pool.execute(
      `UPDATE resultado_pruebas 
       SET actividad_id = ?, test_de_fuerza = ?, test_resistencia = ?, test_velocidad = ?, test_coordinacion = ?, test_de_reaccion = ?
       WHERE test_id = ?`,
      [actividadId, test_de_fuerza, test_resistencia, test_velocidad, test_coordinacion, test_de_reaccion, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Test no encontrado' });
    }

    res.json({ message: 'Test actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando test:', error);
    res.status(500).json({ error: 'Error al actualizar test' });
  }
};

module.exports = {
  getTests,
  getTestsByAtleta,
  createTest,
  getEstadisticasTests,
  getEvolucionTest,
  getUltimoTest,
  deleteTest,
  updateTest
};