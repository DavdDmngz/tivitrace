const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const Usuario = require('../../modelos/usuario.modelo');
const Rol = require('../../modelos/rol.modelo');

const JWT_SECRET = process.env.JWT_SECRET || 'claveSuperSecreta';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const usuario = await Usuario.findByPk(jwt_payload.id, {
        include: {
          model: Rol,
          as: 'roles',
          through: { attributes: [] }, // evita datos de la tabla intermedia
        },
      });

      if (usuario) {
        return done(null, usuario);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

// Middleware para autenticación
exports.validarAutenticacion = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    req.user = user;
    req.usuario_id = user.id; // importante: era "user. id" con espacio, eso es error

    next();
  })(req, res, next);
};

// Middleware para validar roles
exports.validarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const usuario = req.user;

    if (!usuario || !usuario.roles || usuario.roles.length === 0) {
      return res.status(403).json({ mensaje: 'Acceso denegado. Usuario sin roles asignados.' });
    }

    const rolesUsuario = usuario.roles.map(rol => rol.nombre);

    const tienePermiso = rolesUsuario.some(rol => rolesPermitidos.includes(rol));

    if (!tienePermiso) {
      return res.status(403).json({ mensaje: 'No tienes permisos suficientes' });
    }

    next();
  };
};
