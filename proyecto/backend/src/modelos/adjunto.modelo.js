const { DataTypes } = require('sequelize');
const sequelize = require('../core/config/database.config');

const Adjunto = sequelize.define('Adjunto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tarea_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ruta_archivo: {
    type: DataTypes.STRING(255), // En general no necesitas TEXT para una ruta
    allowNull: false
  },
  fecha_subida: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'adjuntos'
});

module.exports = Adjunto;
