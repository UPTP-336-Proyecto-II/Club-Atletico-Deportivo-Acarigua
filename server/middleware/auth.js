const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    const token = req.header('X-Token') || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            code: 50008,
            message: 'No se proporcionó token de autenticación'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            code: 50014,
            message: 'Token inválido o expirado'
        });
    }
};

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'ADMIN') {
        return res.status(403).json({
            code: 50012,
            message: 'No tienes permisos para realizar esta acción'
        });
    }
    next();
};

module.exports = { verificarToken, verificarAdmin };
