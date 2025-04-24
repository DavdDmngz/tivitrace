const { DataTypes } = require('sequelize');
const sequelize = require('../core/config/database.config');
const Rol = require('./rol.modelo');
const Permiso = require('./permiso.modelo');

const RolPermiso = sequelize.define('RolPermiso', {
    rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Rol,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    permiso_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Permiso,
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
    tableName: 'roles_permisos',
    timestamps: false
});

module.exports = RolPermiso;