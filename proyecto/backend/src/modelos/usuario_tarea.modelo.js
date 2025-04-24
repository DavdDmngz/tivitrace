const { DataTypes } = require('sequelize');
const sequelize = require('../core/config/database.config');
const Usuario = require('./usuario.modelo');
const Tarea = require('./tarea.modelo');

const UsuarioTarea = sequelize.define('UsuarioTarea', {
    usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Usuario,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    tarea_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Tarea,
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true, // Agrega `createdAt` y `updatedAt`
    tableName: 'usuarios_tareas'
});

module.exports = UsuarioTarea;