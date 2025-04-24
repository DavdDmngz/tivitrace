const sequelize = require('./core/config/database.config');

// Modelos
const Usuario = require('./modelos/usuario.modelo');
const Rol = require('./modelos/rol.modelo');
const UsuarioRol = require('./modelos/rol_usuario.modelo');
const Proyecto = require('./modelos/proyecto.modelo');
const Tarea = require('./modelos/tarea.modelo');
const UsuarioTarea = require('./modelos/usuario_tarea.modelo');
const Adjunto = require('./modelos/adjunto.modelo');
const Permiso = require('./modelos/permiso.modelo');
const RolPermiso = require('./modelos/rol_permiso.modelo');

async function configurarModelos({ sync = true } = {}) {
  try {
    /** Relación Usuario <-> Rol (muchos a muchos) **/
    Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'usuario_id', as: 'roles' });
    Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'rol_id', as: 'usuarios' });

    /** Relación Rol <-> Permiso (muchos a muchos) **/
    Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'rol_id', as: 'permisos' });
    Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'permiso_id', as: 'roles' });

    /** Relación Proyecto <-> Tareas (uno a muchos) **/
    Proyecto.hasMany(Tarea, { foreignKey: 'proyecto_id', onDelete: 'CASCADE', as: 'tareas' });
    Tarea.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });

    /** Relación Usuario <-> Tarea (muchos a muchos) **/
    Usuario.belongsToMany(Tarea, { through: UsuarioTarea, foreignKey: 'usuario_id', as: 'tareas' });
    Tarea.belongsToMany(Usuario, { through: UsuarioTarea, foreignKey: 'tarea_id', as: 'usuarios' });

    /** Relación Tarea <-> Adjunto (uno a muchos) **/
    Tarea.hasMany(Adjunto, { foreignKey: 'tarea_id', onDelete: 'CASCADE', as: 'adjuntos' });
    Adjunto.belongsTo(Tarea, { foreignKey: 'tarea_id', as: 'tarea' });

    console.log("✅ Relaciones configuradas correctamente");

    if (sync) {
      await sequelize.sync({ alter: true });
      console.log("✅ Modelos sincronizados con la base de datos");
    }
  } catch (error) {
    console.error("❌ Error al configurar modelos:", error);
  }
}

module.exports = {
  configurarModelos,
  modelos: {
    Usuario,
    Rol,
    UsuarioRol,
    Proyecto,
    Tarea,
    UsuarioTarea,
    Adjunto,
    Permiso,
    RolPermiso,
  },
};
