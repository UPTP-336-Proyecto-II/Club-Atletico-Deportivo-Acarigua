const pool = require('../config/database');

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, nombre, apellido, rol, telefono, activo, created_at FROM usuarios WHERE activo = true ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario en la base de datos
    const [users] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? AND activo = true',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar contraseña (simple para desarrollo - sin hash)
    const validPassword = password === '111111';

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createUsuario = async (req, res) => {
  try {
    const { email, password, nombre, apellido, rol, telefono } = req.body;

    // Verificar si el email ya existe
    const [existing] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const [result] = await pool.execute(
      'INSERT INTO usuarios (email, password, nombre, apellido, rol, telefono) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password || '111111', nombre, apellido, rol || 'entrenador', telefono]
    );

    res.status(201).json({ 
      message: 'Usuario creado exitosamente', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

module.exports = {
  getUsuarios,
  login,
  createUsuario
};