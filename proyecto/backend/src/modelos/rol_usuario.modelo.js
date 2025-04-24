const { DataTypes } = require('sequelize');
const db = require('../core/config/database.config');
const usuario = require('./usuario.modelo');
const rol = require('./rol.modelo');

const RolUsuario = db.define('rol_usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: usuario,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: rol,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    fecha_asignacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'rol_usuario',
    timestamps:false
});

module.exports = RolUsuario;