const jwt = require('jsonwebtoken');

// Secret key para JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'club-deportivo-acarigua-secret-key-2024';

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
        }

        // El formato es: "Bearer TOKEN"
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        // Verificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Agregar la información del usuario al request
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRole = decoded.rol;

        next();
    } catch (error) {
        console.error('Error verificando token:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }

        return res.status(500).json({ error: 'Error al verificar token' });
    }
};

module.exports = {
    verifyToken,
    JWT_SECRET
};
