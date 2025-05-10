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
const Participante = require('./modelos/participante.modelo');

async function configurarModelos({ sync = true } = {}) {
  try {
    // Usuario <-> Rol (muchos a muchos)
    Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'usuario_id', as: 'roles' });
    Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'rol_id', as: 'usuarios' });

    // 👇 Relaciones directas para usar include desde UsuarioRol
    UsuarioRol.belongsTo(Rol, { foreignKey: 'rol_id', as: 'rol' });
    UsuarioRol.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

    // Rol <-> Permiso (muchos a muchos)
    Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'rol_id', as: 'permisos' });
    Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'permiso_id', as: 'roles' });

    // Proyecto <-> Tarea (uno a muchos)
    Proyecto.hasMany(Tarea, { foreignKey: 'proyecto_id', onDelete: 'CASCADE', as: 'tareas' });
    Tarea.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });

    // Usuario <-> Tarea (muchos a muchos)
    Usuario.belongsToMany(Tarea, { through: UsuarioTarea, foreignKey: 'usuario_id', as: 'tareas' });
    Tarea.belongsToMany(Usuario, { through: UsuarioTarea, foreignKey: 'tarea_id', as: 'usuarios' });

    // Tarea <-> Adjunto (uno a muchos)
    Tarea.hasMany(Adjunto, { foreignKey: 'tarea_id', onDelete: 'CASCADE', as: 'adjuntos' });
    Adjunto.belongsTo(Tarea, { foreignKey: 'tarea_id', as: 'tarea' });

    // Participante <-> Usuario (muchos a uno)
    Participante.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
    Usuario.hasMany(Participante, { foreignKey: 'usuario_id', as: 'participaciones' });

    // Participante <-> Proyecto (muchos a uno)
    Participante.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto', onDelete: 'CASCADE' });
    Proyecto.hasMany(Participante, { foreignKey: 'proyecto_id', as: 'participantes', onDelete: 'CASCADE' });

    // Participante <-> Tarea (muchos a uno)
    Participante.belongsTo(Tarea, { foreignKey: 'tarea_id', as: 'tarea' });
    Tarea.hasMany(Participante, { foreignKey: 'tarea_id', as: 'participantes' });

    // Relación entre Participante, Tarea y Proyecto (relación indirecta)
    Proyecto.belongsToMany(Tarea, { through: Participante, foreignKey: 'proyecto_id', as: 'tareas_en_proyecto' });
    Tarea.belongsToMany(Proyecto, { through: Participante, foreignKey: 'tarea_id', as: 'proyectos_con_tarea' });

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
    Participante,
  },
};

