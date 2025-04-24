const jwt = require('jsonwebtoken');

// Función para generar el token recibiendo el payload directamente
const generarToken = (payload) => {
  try {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  } catch (error) {
    throw new Error('Error al generar el token: ' + error.message);
  }
};

module.exports = { generarToken };
