const { DataTypes } = require('sequelize');
const sequelize = require('../core/config/database.config');
const Proyecto = require('./proyecto.modelo');

const Tarea = sequelize.define('Tarea', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    proyecto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Proyecto,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_inicio: {
        type: DataTypes.DATE, // Cambiar TIMESTAMP por DATE
        defaultValue: DataTypes.NOW
    },
    fecha_fin: {
        type: DataTypes.DATE, // También usa DATE para fecha_fin
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'en progreso', 'finalizado'),
        defaultValue: 'pendiente'
    }    
}, {
    tableName: 'tareas',
    timestamps: false
});

module.exports = Tarea;