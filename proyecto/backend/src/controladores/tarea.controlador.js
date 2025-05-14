const Tarea = require('../modelos/tarea.modelo');
const Proyecto = require('../modelos/proyecto.modelo');
const Adjunto = require('../modelos/adjunto.modelo');
const Participante = require('../modelos/participante.modelo');
const actualizarProgresoProyecto = require('../core/helpers/update_proyect.helper');

// Obtener todas las tareas
exports.obtenerTareas = async (req, res) => {
  try {
    const usuario = req.user;
    const proyectoId = req.query.proyecto_id;
    const verTodas = req.query.verTodas === 'true';

    const roles = usuario.roles || [];
    const esAdmin = roles.some(r => r.nombre === 'administrador');

    let tareas;

    if (esAdmin || verTodas) {
      tareas = await Tarea.findAll({
        where: { proyecto_id: proyectoId },
        include: [{ model: Participante, as: 'participantes' }]
      });
    } else {
      tareas = await Tarea.findAll({
        where: { proyecto_id: proyectoId },
        include: [
          {
            model: Participante,
            as: 'participantes',
            where: { usuario_id: usuario.id },
            attributes: []
          }
        ]
      });
    }

    res.json(tareas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las tareas', detalle: error.message });
  }
};

// Obtener una tarea por ID
exports.obtenerTareaPorId = async (req, res) => {
  try {
    const tarea = await Tarea.findByPk(req.params.id, {
      include: [{ model: Proyecto, as: 'proyecto' }]
    });

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(tarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la tarea', detalle: error.message });
  }
};

// Crear una nueva tarea
exports.crearTarea = async (req, res) => {
  try {
    const usuario = req.user;
    const roles = usuario.roles || [];
    const esAdmin = roles.some(r => r.nombre === 'administrador');

    if (!esAdmin) {
      return res.status(403).json({ error: 'Solo los administradores pueden crear tareas' });
    }

    const { nombre, descripcion, estado, proyecto_id } = req.body;

    if (!nombre || !proyecto_id) {
      return res.status(400).json({ error: 'El nombre de la tarea y el proyecto_id son obligatorios' });
    }

    if (estado && !['sin_comenzar', 'en_proceso', 'pendiente', 'finalizado'].includes(estado.toLowerCase())) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const nuevaTarea = await Tarea.create({
      nombre,
      descripcion,
      estado: estado || 'sin_comenzar',
      proyecto_id
    });

    await actualizarProgresoProyecto(nuevaTarea.proyecto_id);

    res.status(201).json({ mensaje: 'Tarea creada exitosamente', tarea: nuevaTarea });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea', detalle: error.message });
  }
};

// Actualizar una tarea
exports.actualizarTarea = async (req, res) => {
  try {
    const usuario = req.user;
    const roles = usuario.roles || [];
    const esAdmin = roles.some(r => r.nombre === 'administrador');

    const tarea = await Tarea.findByPk(req.params.id, {
      include: [{ model: Participante, as: 'participantes' }]
    });

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const esParticipante = tarea.participantes.some(p => p.usuario_id === usuario.id);

    if (!esAdmin && !esParticipante) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta tarea' });
    }

    const { nombre, descripcion, estado, proyecto_id } = req.body;

    if (estado && !['sin_comenzar', 'en_proceso', 'pendiente', 'finalizado'].includes(estado.toLowerCase())) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    await tarea.update({
      nombre: nombre || tarea.nombre,
      descripcion: descripcion || tarea.descripcion,
      estado: estado || tarea.estado,
      proyecto_id: proyecto_id || tarea.proyecto_id
    });

    await actualizarProgresoProyecto(tarea.proyecto_id);

    res.json({ mensaje: 'Tarea actualizada correctamente', tarea });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarea', detalle: error.message });
  }
};

// Cambiar estado de la tarea
exports.cambiarEstadoTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const usuario = req.user;

    if (
      !estado ||
      typeof estado !== 'string' ||
      !['sin_comenzar', 'en_proceso', 'pendiente', 'finalizado'].includes(estado.trim().toLowerCase())
    ) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const tarea = await Tarea.findByPk(id, {
      include: [
        { model: Participante, as: 'participantes' },
        { model: Proyecto, as: 'proyecto' },
      ],
    });

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const roles = usuario.roles || [];
    const esAdmin = roles.some((r) => r.nombre === 'administrador');
    const esParticipante = tarea.participantes.some((p) => p.usuario_id === usuario.id);

    if (!esAdmin && !esParticipante) {
      return res.status(403).json({ error: 'No tienes permiso para cambiar el estado de esta tarea' });
    }

    // Evitar que se modifique una tarea finalizada, a menos que sea admin
    if (tarea.estado === 'finalizado' && !esAdmin) {
      return res.status(403).json({ error: 'No se puede modificar una tarea finalizada, salvo que seas administrador' });
    }

    const estadoNuevo = estado.trim().toLowerCase();
    const requiereRevision = tarea.proyecto.requiere_revision;

    if (estadoNuevo === 'pendiente') {
      tarea.estado = 'pendiente';
    } else if (estadoNuevo === 'finalizado') {
      if (requiereRevision && !esAdmin) {
        return res.status(403).json({
          error: 'Solo los administradores pueden finalizar una tarea que requiere revisión',
        });
      }
      tarea.estado = 'finalizado';
      tarea.fecha_fin = new Date(); // Asigna la fecha y hora actuales al finalizar
    } else {
      tarea.estado = estadoNuevo;
    }

    await tarea.save();
    await actualizarProgresoProyecto(tarea.proyecto_id);

    res.status(200).json({
      mensaje: 'Estado actualizado correctamente',
      tarea: {
        id: tarea.id,
        estado: tarea.estado,
        nombre: tarea.nombre,
        descripcion: tarea.descripcion,
        fecha_fin: tarea.fecha_fin,
      },
    });

  } catch (error) {
    console.error('Error al actualizar el estado de la tarea:', error);
    res.status(500).json({ error: 'Error al actualizar el estado', detalle: error.message });
  }
};


// Eliminar una tarea
exports.eliminarTarea = async (req, res) => {
  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const proyectoId = tarea.proyecto_id;
    await tarea.destroy();

    await actualizarProgresoProyecto(proyectoId);

    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea', detalle: error.message });
  }
};

// adjuntos

// Obtener todos los adjuntos de una tarea
exports.obtenerAdjuntosPorTarea = async (req, res) => {
  try {
    const { id } = req.params;

    const tarea = await Tarea.findByPk(id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const adjuntos = await Adjunto.findAll({
      where: { tarea_id: id }
    });

    res.json(adjuntos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los adjuntos', detalle: error.message });
  }
};
// Subir adjuntos a una tarea (varios archivos)
exports.subirAdjunto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const tarea = await Tarea.findByPk(id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const archivosSubidos = [];

    // Guardar cada archivo en la base de datos
    for (let file of req.files) {
      const adjunto = await Adjunto.create({
        tarea_id: id,
        nombre_archivo: file.originalname,
        ruta_archivo: file.path,
        fecha_subida: new Date()
      });
      archivosSubidos.push(adjunto);
    }

    res.status(201).json({ mensaje: 'Archivos subidos correctamente', adjuntos: archivosSubidos });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir los archivos', detalle: error.message });
  }
};

// Editar un adjunto
exports.editarAdjunto = async (req, res) => {
  try {
    const { tareaId, archivoId } = req.params;

    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const adjunto = await Adjunto.findByPk(archivoId);
    if (!adjunto) {
      return res.status(404).json({ error: 'Adjunto no encontrado' });
    }

    if (req.file) {
      adjunto.nombre_archivo = req.file.originalname;
      adjunto.ruta_archivo = req.file.path;
      adjunto.fecha_subida = new Date();
      await adjunto.save();
    }

    res.json({ mensaje: 'Adjunto actualizado correctamente', adjunto });
  } catch (error) {
    res.status(500).json({ error: 'Error al editar el adjunto', detalle: error.message });
  }
};

// Eliminar un adjunto
exports.eliminarAdjunto = async (req, res) => {
  try {
    const { tareaId, archivoId } = req.params;

    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const adjunto = await Adjunto.findByPk(archivoId);
    if (!adjunto) {
      return res.status(404).json({ error: 'Adjunto no encontrado' });
    }

    await adjunto.destroy();

    res.json({ mensaje: 'Adjunto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el adjunto', detalle: error.message });
  }
};