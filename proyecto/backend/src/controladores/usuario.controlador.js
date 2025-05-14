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
            // Obtener los usuarios con el nombre del rol asociado a cada usuario
            const usuarios = await Usuarios.findAll({
                include: [
                    {
                        model: Roles,  // Modelo de rol
                        as: 'roles',  // Alias usado en la relación
                        attributes: ['nombre'],  // Traemos solo el campo 'nombre' del rol
                        through: { attributes: [] }  // Ignoramos los atributos de la tabla intermedia
                    }
                ]
            });
    
            // Mapear los usuarios para incluir el nombre del rol
            const usuariosConRol = usuarios.map(usuario => {
                // Verificamos si el usuario tiene roles asignados
                const rol = usuario.roles.length > 0 ? usuario.roles[0].nombre : null;  // Solo tomamos el primer rol
                return {
                    ...usuario.toJSON(),  // Convertimos el usuario a un objeto plano
                    rol: rol  // Agregamos el rol al objeto
                };
            });
    
            // Devolvemos los usuarios con el rol
            res.json(usuariosConRol);
        } catch (error) {
            // En caso de error, respondemos con un mensaje de error
            res.status(500).json({ msg: 'Error al obtener usuarios', error });
        }
    },    

    async obtenerUsuarioPorId(req, res) {
        try {
            // Buscar el usuario por ID incluyendo el nombre del rol
            const usuario = await Usuarios.findByPk(req.params.id, {
                include: [
                    {
                        model: Roles,
                        as: 'roles',
                        attributes: ['nombre'],
                        through: { attributes: [] }
                    }
                ]
            });
    
            // Si no se encuentra, retornar 404
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
    
            // Convertir a objeto plano y agregar el campo 'rol'
            const usuarioJSON = usuario.toJSON();
            const rol = usuarioJSON.roles?.[0]?.nombre || null;
    
            const usuarioConRol = {
                ...usuarioJSON,
                rol: rol
            };
    
            res.json(usuarioConRol);
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
    
            let nuevaImagenUrl = usuario.imagenUrl; // corregido: imagenUrl
    
            if (req.file) {
                const fs = require('fs');
                const path = require('path');
    
                // Borrar imagen anterior si existe
                if (usuario.imagenUrl) {
                    const rutaAnterior = path.join(__dirname, `../../public${usuario.imagenUrl}`);
                    if (fs.existsSync(rutaAnterior)) {
                        fs.unlinkSync(rutaAnterior);
                    }
                }
    
                nuevaImagenUrl = `/img/usuarios/${req.file.filename}`;
            }
    
            // Solo actualizar la contraseña si la enviaron
            if (contrasena) {
                usuario.contrasena = await bcrypt.hash(contrasena, 10);
            }
    
            await usuario.update({
                nombre,
                apellido,
                correo,
                codigo_pais,
                telefono,
                imagenUrl: nuevaImagenUrl
            });
    
            res.json({ msg: 'Usuario actualizado correctamente', usuario });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al actualizar usuario', error: error.message });
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

    async actualizarImagenUsuario(req, res) {
        try {
            const usuarioId = req.params.id;
    
            if (!req.file) {
                return res.status(400).json({ msg: 'No se recibió ninguna imagen' });
            }
    
            const usuario = await Usuarios.findByPk(usuarioId);
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
    
            // 🔥 Borrar imagen anterior si existe
            const fs = require('fs');
            const path = require('path');
            if (usuario.imagenUrl) {
                const rutaAnterior = path.join(__dirname, `../../public/img/usuarios/${usuario.imagenUrl}`);
                if (fs.existsSync(rutaAnterior)) {
                    fs.unlinkSync(rutaAnterior);
                }
            }
    
            // Guardar solo el nombre del archivo (sin la ruta completa) en la base de datos
            const imagenNombre = req.file.filename; // Solo el nombre del archivo
            await usuario.update({ imagenUrl: imagenNombre }); // Almacenar solo el nombre del archivo
    
            // Responder con la URL completa para que el frontend la utilice
            const imagenUrlCompleta = `http://localhost:3003/img/usuarios/${imagenNombre}`;
    
            res.json({
                msg: 'Imagen de perfil actualizada exitosamente',
                imagenUrl: imagenUrlCompleta
            });
        } catch (error) {
            res.status(500).json({ msg: 'Error al actualizar imagen de perfil', error: error.message });
        }
    }      
};
module.exports = usuarioController;