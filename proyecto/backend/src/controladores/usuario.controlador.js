const { validationResult } = require('express-validator');
const Usuarios = require('../modelos/usuario.modelo');
const Roles = require('../modelos/rol.modelo');
const UsuarioRoles = require('../modelos/rol_usuario.modelo');
const { Op, fn, col, where } = require('sequelize');
const bcrypt = require('bcrypt');

const usuarioController = {
    async crearUsuario(req, res) {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        try {
            const { nombre, apellido, correo, contrasena, codigo_pais, telefono } = req.body;
            const usuarioExistente = await Usuarios.findOne({ where: { correo } });

            if (usuarioExistente) {
                return res.status(400).json({ msg: 'El correo ya está registrado.' });
            }

            const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

            const nuevoUsuario = await Usuarios.create({
                nombre,
                apellido,
                correo,
                contrasena: contrasenaEncriptada,
                codigo_pais,
                telefono
            });

            const rolPorDefecto = await Roles.findOne({
                where: where(fn('LOWER', col('nombre')), Op.eq, 'usuario')
            });
            if (!rolPorDefecto) {
                return res.status(500).json({ msg: 'Rol por defecto "usuario" no encontrado.' });
            }

            await UsuarioRoles.create({
                usuario_id: nuevoUsuario.id,
                rol_id: rolPorDefecto.id
            });

            res.status(201).json({ msg: 'Usuario creado exitosamente', usuario: nuevoUsuario });
        } catch (error) {
            res.status(500).json({ msg: 'Error al crear usuario', error });
        }
    },

    async obtenerUsuarios(req, res) {
        try {
            const usuarios = await Usuarios.findAll();
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener usuarios', error });
        }
    },

    async obtenerUsuarioPorId(req, res) {
        try {
            const usuario = await Usuarios.findByPk(req.params.id);
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener usuario', error });
        }
    },

    async actualizarUsuario(req, res) {
        try {
            const usuario = await Usuarios.findByPk(req.params.id);
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            const { nombre, apellido, correo, contrasena, codigo_pais, telefono } = req.body;
            if (contrasena) {
                usuario.contrasena = bcrypt.hashSync(contrasena, bcrypt.genSaltSync(10));
            }

            await usuario.update({ nombre, apellido, correo, codigo_pais, telefono });
            res.json({ msg: 'Usuario actualizado correctamente', usuario });
        } catch (error) {
            res.status(500).json({ msg: 'Error al actualizar usuario', error });
        }
    },

    async eliminarUsuario(req, res) {
        try {
            const usuario = await Usuarios.findByPk(req.params.id);
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            await usuario.destroy();
            res.json({ msg: 'Usuario eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ msg: 'Error al eliminar usuario', error });
        }
    },
};

module.exports = usuarioController;
