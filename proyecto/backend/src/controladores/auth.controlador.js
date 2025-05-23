const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuarios = require('../modelos/usuario.modelo');
const Roles = require('../modelos/rol.modelo');
const ModeloRolUsuario = require('../modelos/rol_usuario.modelo');
const ModeloRolPermiso = require('../modelos/rol_permiso.modelo');
const ModeloPermiso = require('../modelos/permiso.modelo');
const { enviarCorreoRecuperacion } = require('../core/services/mail.service');
const { generarAccessToken, generarRefreshToken } = require('../core/config/jwt.config');


exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const usuario = await Usuarios.findOne({
      where: { correo },
      include: {
        model: Roles,
        as: 'roles',
        through: { attributes: [] }
      }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const roles = usuario.roles.map(rol => rol.nombre);

    const payload = {
      id: usuario.id,
      roles
    };

    const accessToken = generarAccessToken(payload);
    const refreshToken = generarRefreshToken(payload);

    // Puedes guardar el refresh token en BD si lo deseas para revocación
    // await usuario.update({ refresh_token: refreshToken });

    return res.json({ accessToken, refreshToken });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Refrescar Token
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body; // El refresh token enviado desde el frontend

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token no proporcionado' });
    }

    try {
        // Verificar el refreshToken
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Generar un nuevo accessToken
        const nuevoAccessToken = generarAccessToken({
            id: payload.id,
            roles: payload.roles,
        });

        // Opcional: Generar un nuevo refreshToken
        const nuevoRefreshToken = generarRefreshToken({
            id: payload.id,
            roles: payload.roles,
        });

        // Enviar los nuevos tokens al cliente
        return res.json({
            accessToken: nuevoAccessToken,
            refreshToken: nuevoRefreshToken, // Opcional
        });
    } catch (error) {
        console.error('Error al verificar el refresh token:', error);
        return res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }
};


// Solicitar clave temporal
exports.solicitarClaveTemporal = async (req, res) => {
    try {
        const { correo } = req.body;
        const usuario = await Usuarios.findOne({ where: { correo } });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Correo no registrado' });
        }

        const clave_recuperacion = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await usuario.update({ token_recuperacion: clave_recuperacion, token_expiracion: expiracion });

        await enviarCorreoRecuperacion(correo, clave_recuperacion);
        return res.status(200).json({ mensaje: 'Código de recuperación enviado' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

// Cambiar contraseña
exports.cambiarContrasena = async (req, res) => {
    try {
        const { correo, codigo, nuevaContrasena } = req.body;
        const usuario = await Usuarios.findOne({ where: { correo } });

        if (!usuario) {
            return res.status(400).json({ mensaje: 'Usuario no encontrado' });
        }

        if (usuario.token_recuperacion !== codigo || new Date() > new Date(usuario.token_expiracion)) {
            return res.status(400).json({ mensaje: 'Código de recuperación inválido o expirado' });
        }

        const esIgual = await bcrypt.compare(nuevaContrasena, usuario.contrasena);
        if (esIgual) {
            return res.status(400).json({ mensaje: 'La nueva contraseña no puede ser igual a la actual' });
        }

        const hash = await bcrypt.hash(nuevaContrasena, 10);

        await usuario.update({
            contrasena: hash,
            token_recuperacion: null,
            token_expiracion: null
        });

        return res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

// Middleware: Verificar sesión JWT
exports.verificarSesion = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
        }

        const payload = jwt.verify(token, JWT_SECRET);
        req.usuario = payload;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware: Verificar permisos
exports.verificarPermiso = (permisoRequerido) => {
    return async (req, res, next) => {
        try {
            const usuarioId = req.usuario.id;

            const rolesUsuario = await ModeloRolUsuario.findAll({
                where: { usuario_id: usuarioId }
            });

            if (!rolesUsuario.length) {
                return res.status(403).json({ error: 'Acceso denegado. No tiene roles asignados.' });
            }

            const rolesIds = rolesUsuario.map(r => r.rol_id);

            const permisos = await ModeloRolPermiso.findAll({
                where: { rol_id: rolesIds },
                include: [{ model: ModeloPermiso, as: 'permiso' }]
            });

            const listaPermisos = permisos.map(p => p.permiso.nombre);

            if (!listaPermisos.includes(permisoRequerido)) {
                return res.status(403).json({ error: `Acceso denegado. No tiene el permiso: ${permisoRequerido}` });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
        }
    };
};
