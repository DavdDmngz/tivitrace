const { DataTypes } = require('sequelize');
const db = require('../core/config/database.config');

const Permiso = db.define('Permiso', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'permisos',
    timestamps: false
});

module.exports = Permiso;