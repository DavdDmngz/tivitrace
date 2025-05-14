const { DataTypes } = require('sequelize');
const sequelize = require('../core/config/database.config');

const Proyecto = sequelize.define('proyecto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    progreso: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    fecha_fin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'en_proceso',
        validate: {
            isIn: [['en_proceso', 'pendiente', 'finalizado', 'cancelado']]
        }
    }
}, {
    tableName: 'proyecto',
    timestamps: false
});

module.exports = Proyecto;
