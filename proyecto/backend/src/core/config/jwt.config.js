const jwt = require('jsonwebtoken');

const generarAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' }); // corto plazo
};

const generarRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }); // largo plazo
};

module.exports = {
  generarAccessToken,
  generarRefreshToken
};
