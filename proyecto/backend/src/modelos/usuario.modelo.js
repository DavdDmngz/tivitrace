const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const db = require('../core/config/database.config');

const Usuarios = db.define('usuarios', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { 
        type: DataTypes.STRING(50), 
        allowNull: false, 
        validate: { 
            notEmpty: { msg: 'El campo nombre no puede ir vacío.' } 
        } 
    },
    apellido: { 
        type: DataTypes.STRING(50), 
        allowNull: false 
    },
    correo: { 
        type: DataTypes.STRING(250), 
        allowNull: false, 
        unique: true,
        validate: { 
            notEmpty: { msg: 'El campo correo no puede ir vacío.' },
            isEmail: { msg: 'El correo debe tener un formato válido.' }
        }
    },
    contrasena: { 
        type: DataTypes.STRING(250), 
        allowNull: false, 
        validate: { 
            notEmpty: { msg: 'El campo contraseña no puede ir vacío.' }
        } 
    },
    codigo_pais: { 
        type: DataTypes.STRING(5), 
        allowNull: true 
    },
    telefono: { 
        type: DataTypes.STRING(20), 
        allowNull: true 
    },
    estado: { 
        type: DataTypes.ENUM('activo', 'inactivo', 'bloqueado'), 
        allowNull: false, 
        defaultValue: 'activo' 
    },
    token_recuperacion: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    token_expiracion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    imagenUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.contrasena && !usuario.contrasena.startsWith('$2b$')) {
                usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
            }
        },
        beforeUpdate: async (usuario) => {
            if (usuario.changed('contrasena') && !usuario.contrasena.startsWith('$2b$')) {
                usuario.contrasena = await bcrypt.hash(usuario.contrasena, 10);
            }
        }
    }
    
});

module.exports = Usuarios;
