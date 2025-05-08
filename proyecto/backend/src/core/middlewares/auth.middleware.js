const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ mensaje: 'Token inválido o expirado' });
        }

        req.usuarioId = decoded.id;      // ✅ cambio aquí
        req.roles = decoded.roles || []; // opcional
        next();
    });
};

module.exports = verificarToken;
