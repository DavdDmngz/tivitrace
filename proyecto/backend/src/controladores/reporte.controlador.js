const Usuarios = require('../modelos/usuario.modelo');
const Proyecto = require('../modelos/proyecto.modelo');
const Tarea = require('../modelos/tarea.modelo');
const Participante = require('../modelos/participante.modelo');
const UsuarioRol = require('../modelos/rol_usuario.modelo');
const Rol = require('../modelos/rol.modelo');
const { Sequelize } = require('sequelize');

// GET /api/reportes/dashboard
exports.dashboard = async (req, res) => {
  try {
    // Total de usuarios
    const totalUsuarios = await Usuarios.count();

    // Proyectos por estado
    const proyectosPorEstado = await Proyecto.findAll({
      attributes: ['estado', [Sequelize.fn('COUNT', Sequelize.col('estado')), 'cantidad']],
      group: ['estado']
    });

    // Progreso promedio de proyectos
    const progresoPromedio = await Proyecto.findAll({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('progreso')), 'promedio']]
    });

    // Total de tareas por estado
    const tareasPorEstado = await Tarea.findAll({
      attributes: ['estado', [Sequelize.fn('COUNT', Sequelize.col('estado')), 'cantidad']],
      group: ['estado']
    });

    // Total de participaciones por usuario
    const participaciones = await Participante.findAll({
      attributes: ['usuario_id', [Sequelize.fn('COUNT', Sequelize.col('tarea_id')), 'tareas']],
      group: ['usuario_id']
    });

    // Usuarios por rol
    const usuariosPorRol = await UsuarioRol.findAll({
      attributes: ['rol_id', [Sequelize.fn('COUNT', Sequelize.col('usuario_id')), 'usuarios']],
      include: [{
        model: Rol,
        as: 'rol', // ✅ alias correcto
        attributes: ['nombre']
      }],
      group: ['rol_id', 'rol.id']
    });

    res.json({
      totalUsuarios,
      proyectosPorEstado,
      progresoPromedio: parseFloat(progresoPromedio[0].dataValues.promedio || 0).toFixed(2),
      tareasPorEstado,
      participaciones,
      usuariosPorRol
    });

  } catch (error) {
    console.error('Error en estadísticas:', error);
    res.status(500).json({ error: 'Error al generar estadísticas.' });
  }
};

// GET /api/reportes/usuarios-por-estado
exports.usuariosPorEstado = async (req, res) => {
  try {
    const usuariosPorEstado = await Usuarios.findAll({
      attributes: ['estado', [Sequelize.fn('COUNT', Sequelize.col('estado')), 'cantidad']],
      group: ['estado']
    });

    res.json(usuariosPorEstado);
  } catch (error) {
    console.error('Error en usuarios por estado:', error);
    res.status(500).json({ error: 'Error al generar reporte de usuarios por estado.' });
  }
};

// GET /api/reportes/proyectos-por-fecha
exports.proyectosPorFecha = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const proyectosPorFecha = await Proyecto.findAll({
      where: {
        fecha_creacion: {
          [Sequelize.Op.between]: [startDate, endDate]
        }
      },
      attributes: ['fecha_creacion', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad']],
      group: [Sequelize.fn('DATE', Sequelize.col('fecha_creacion'))],
      order: [[Sequelize.col('fecha_creacion'), 'ASC']]
    });

    res.json(proyectosPorFecha);
  } catch (error) {
    console.error('Error en proyectos por fecha:', error);
    res.status(500).json({ error: 'Error al generar reporte de proyectos por fecha.' });
  }
};

// GET /api/reportes/tareas-por-proyecto
exports.tareasPorProyecto = async (req, res) => {
  try {
    const tareasPorProyecto = await Tarea.findAll({
      attributes: [
        'proyecto_id',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad'],
        [Sequelize.fn('AVG', Sequelize.col('estado')), 'promedio_completado']
      ],
      group: ['proyecto_id']
    });

    res.json(tareasPorProyecto);
  } catch (error) {
    console.error('Error en tareas por proyecto:', error);
    res.status(500).json({ error: 'Error al generar reporte de tareas por proyecto.' });
  }
};

// GET /api/reportes/usuarios-con-mas-tareas
exports.usuariosConMasTareas = async (req, res) => {
  try {
    const usuariosConMasTareas = await Participante.findAll({
      attributes: ['usuario_id', [Sequelize.fn('COUNT', Sequelize.col('tarea_id')), 'cantidad']],
      group: ['usuario_id'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('tarea_id')), 'DESC']],
      limit: 10
    });

    res.json(usuariosConMasTareas);
  } catch (error) {
    console.error('Error en usuarios con más tareas:', error);
    res.status(500).json({ error: 'Error al generar reporte de usuarios con más tareas.' });
  }
};

// GET /api/reportes/proyectos-cerca-fecha-fin
exports.proyectosCercaFechaFin = async (req, res) => {
  try {
    const proyectosCercaFin = await Proyecto.findAll({
      where: {
        fecha_fin: {
          [Sequelize.Op.between]: [
            Sequelize.literal('CURDATE()'),
            Sequelize.literal('DATE_ADD(CURDATE(), INTERVAL 7 DAY)')
          ]
        }
      },
      attributes: ['id', 'nombre', 'fecha_fin']
    });

    res.json(proyectosCercaFin);
  } catch (error) {
    console.error('Error en proyectos cerca de fecha de fin:', error);
    res.status(500).json({ error: 'Error al generar reporte de proyectos cerca de fecha de fin.' });
  }
};

// GET /api/reportes/promedio-tiempo-ejecucion
exports.promedioTiempoEjecucion = async (req, res) => {
  try {
    const tareas = await Tarea.findAll({
      where: {
        fecha_inicio: { [Sequelize.Op.ne]: null },
        fecha_fin: { [Sequelize.Op.ne]: null }
      },
      attributes: [
        [Sequelize.fn('TIMESTAMPDIFF', Sequelize.literal('DAY'), Sequelize.col('fecha_inicio'), Sequelize.col('fecha_fin')), 'dias_ejecucion']
      ]
    });

    const totalDias = tareas.reduce((acc, tarea) => acc + parseFloat(tarea.dataValues.dias_ejecucion), 0);
    const promedio = tareas.length ? totalDias / tareas.length : 0;

    res.json({ promedio: promedio.toFixed(2) });
  } catch (error) {
    console.error('Error en promedio tiempo de ejecución:', error);
    res.status(500).json({ error: 'Error al generar reporte de promedio tiempo de ejecución.' });
  }
};
