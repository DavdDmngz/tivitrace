const { DataTypes } = require('sequelize');
const db = require('../core/config/database.config');

const Roles = db.define('roles', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { 
        type: DataTypes.STRING(50), 
        allowNull: false, 
        validate: { 
            notEmpty: { msg: 'El campo nombre no puede ir vacío.' } 
        } 
    }
}, {
    tableName: 'roles',
    timestamps: false
});

module.exports = Roles;