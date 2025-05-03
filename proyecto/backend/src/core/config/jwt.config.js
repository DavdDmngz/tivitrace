const jwt = require('jsonwebtoken');

const generarAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION_ACCESS_DEV }); // Usar variable de entorno
};

const generarRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_EXPIRATION_REFRESH }); // Usar variable de entorno
};

module.exports = {
  generarAccessToken,
  generarRefreshToken
};
