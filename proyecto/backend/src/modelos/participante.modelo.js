const { DataTypes } = require('sequelize');
const sequelize = require('../core/config/database.config');

const Participante = sequelize.define('participante', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    proyecto_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tarea_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'participantes',
    timestamps: false
});

module.exports = Participante;
