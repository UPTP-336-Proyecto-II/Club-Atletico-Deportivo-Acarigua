const pool = require('../config/database');

// Obtener todas las fichas médicas
const getFichasMedicas = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT f.*, 
              a.NOMBRE as atleta_nombre,
              a.APELLIDO as atleta_apellido
       FROM ficha_medica f
       LEFT JOIN atletas a ON f.ATLETA_ID = a.ATLETA_ID
       ORDER BY f.CREATED_AT DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo fichas médicas:', error);
        res.status(500).json({ error: 'Error al obtener fichas médicas' });
    }
};

// Obtener ficha médica por atleta
const getFichaMedicaByAtleta = async (req, res) => {
    try {
        const { atleta_id } = req.params;

        const [rows] = await pool.execute(
            `SELECT f.*, 
              a.NOMBRE as atleta_nombre,
              a.APELLIDO as atleta_apellido
       FROM ficha_medica f
       LEFT JOIN atletas a ON f.ATLETA_ID = a.ATLETA_ID
       WHERE f.ATLETA_ID = ?`,
            [atleta_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Ficha médica no encontrada' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo ficha médica:', error);
        res.status(500).json({ error: 'Error al obtener ficha médica' });
    }
};

// Crear ficha médica
const createFichaMedica = async (req, res) => {
    try {
        const {
            atleta_id,
            alergias,
            tipo_sanguineo,
            lesion,
            condicion_medica,
            observacion
        } = req.body;

        // Verificar si ya existe ficha para este atleta
        const [existing] = await pool.execute(
            'SELECT FICHA_ID FROM ficha_medica WHERE ATLETA_ID = ?',
            [atleta_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Ya existe una ficha médica para este atleta' });
        }

        const [result] = await pool.execute(
            `INSERT INTO ficha_medica 
       (ATLETA_ID, ALERGIAS, TIPO_SANGUINEO, LESION, CONDICION_MEDICA, OBSERVACION) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [atleta_id, alergias, tipo_sanguineo, lesion, condicion_medica, observacion]
        );

        res.status(201).json({
            message: 'Ficha médica creada exitosamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error creando ficha médica:', error);
        res.status(500).json({ error: 'Error al crear ficha médica' });
    }
};

// Actualizar ficha médica
const updateFichaMedica = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            alergias,
            tipo_sanguineo,
            lesion,
            condicion_medica,
            observacion
        } = req.body;

        const [result] = await pool.execute(
            `UPDATE ficha_medica 
       SET ALERGIAS = ?, TIPO_SANGUINEO = ?, LESION = ?, CONDICION_MEDICA = ?, OBSERVACION = ?
       WHERE FICHA_ID = ?`,
            [alergias, tipo_sanguineo, lesion, condicion_medica, observacion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ficha médica no encontrada' });
        }

        res.json({ message: 'Ficha médica actualizada exitosamente' });
    } catch (error) {
        console.error('Error actualizando ficha médica:', error);
        res.status(500).json({ error: 'Error al actualizar ficha médica' });
    }
};

module.exports = {
    getFichasMedicas,
    getFichaMedicaByAtleta,
    createFichaMedica,
    updateFichaMedica
};
