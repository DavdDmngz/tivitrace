const Tarea = require('../modelos/tarea.modelo');
const Proyecto = require('../modelos/proyecto.modelo');
const Adjunto = require('../modelos/adjunto.modelo');
const actualizarProgresoProyecto = require('../core/helpers/update_proyect.helper');

// Obtener todas las tareas
exports.obtenerTareas = async (req, res) => {
    try {
      const tareas = await Tarea.findAll({
        where: { proyecto_id: req.query.proyecto_id },
      });
      res.json(tareas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al obtener las tareas' });
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
        const { nombre, descripcion, estado, proyecto_id } = req.body;

        if (!nombre || !proyecto_id) {
            return res.status(400).json({ error: 'El nombre de la tarea y el proyecto_id son obligatorios' });
        }

        // Validar el estado de la tarea si se proporciona
        if (estado && !['pendiente', 'en progreso', 'finalizado'].includes(estado.toLowerCase())) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        // Crear la tarea
        const nuevaTarea = await Tarea.create({
            nombre,
            descripcion,
            estado: estado || 'pendiente', // Si no se proporciona estado, se asigna 'pendiente'
            proyecto_id
        });

        // Actualizar el progreso del proyecto
        await actualizarProgresoProyecto(nuevaTarea.proyecto_id);

        res.status(201).json({ mensaje: 'Tarea creada exitosamente', tarea: nuevaTarea });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la tarea', detalle: error.message });
    }
};

// Actualizar una tarea
exports.actualizarTarea = async (req, res) => {
    try {
        const tarea = await Tarea.findByPk(req.params.id);
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        // Validar los cambios
        const { nombre, descripcion, estado, proyecto_id } = req.body;

        if (estado && !['pendiente', 'en progreso', 'finalizado'].includes(estado.toLowerCase())) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        // Actualizar la tarea
        await tarea.update({
            nombre: nombre || tarea.nombre,
            descripcion: descripcion || tarea.descripcion,
            estado: estado || tarea.estado,
            proyecto_id: proyecto_id || tarea.proyecto_id
        });

        // Actualizar el progreso del proyecto
        await actualizarProgresoProyecto(tarea.proyecto_id);

        res.json({ mensaje: 'Tarea actualizada correctamente', tarea });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la tarea', detalle: error.message });
    }
};

// Cambiar estado de la tarea (drag and drop)
exports.cambiarEstadoTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Validar que el estado sea una cadena no vacía y sea uno de los valores permitidos
        if (!estado || typeof estado !== 'string' || !['pendiente', 'en progreso', 'finalizado'].includes(estado.trim().toLowerCase())) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        // Buscar la tarea por su ID
        const tarea = await Tarea.findByPk(id);
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        // Actualizar el estado de la tarea
        tarea.estado = estado.trim().toLowerCase(); // Normalizamos el estado a minúsculas
        await tarea.save();

        // Actualizar el progreso del proyecto
        await actualizarProgresoProyecto(tarea.proyecto_id);

        // Enviar la respuesta con la tarea actualizada
        res.status(200).json({
            mensaje: 'Estado actualizado correctamente',
            tarea: {
                id: tarea.id,
                estado: tarea.estado,
                nombre: tarea.nombre,
                descripcion: tarea.descripcion
            }
        });
    } catch (error) {
        console.error('Error al actualizar el estado de la tarea:', error); // Log para depuración
        res.status(500).json({
            error: 'Error al actualizar el estado',
            detalle: error.message,
            stack: error.stack // Detalle completo del error, útil para depuración
        });
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

        // Actualizar el progreso del proyecto
        await actualizarProgresoProyecto(proyectoId);

        res.json({ mensaje: 'Tarea eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea', detalle: error.message });
    }
};

// Subir un adjunto a una tarea
exports.subirAdjunto = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        // Verificar si la tarea existe
        const tarea = await Tarea.findByPk(id);
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        const adjunto = await Adjunto.create({
            tarea_id: id,
            nombre_archivo: req.file.originalname,
            ruta_archivo: req.file.path,
            fecha_subida: new Date()
        });

        res.status(201).json({ mensaje: 'Archivo subido correctamente', adjunto });
    } catch (error) {
        res.status(500).json({ error: 'Error al subir el archivo', detalle: error.message });
    }
};

// Editar un adjunto de una tarea
exports.editarAdjunto = async (req, res) => {
    try {
        const { tareaId, archivoId } = req.params;

        // Verificar si la tarea y el adjunto existen
        const tarea = await Tarea.findByPk(tareaId);
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        const adjunto = await Adjunto.findByPk(archivoId);
        if (!adjunto) {
            return res.status(404).json({ error: 'Adjunto no encontrado' });
        }

        // Actualizar el archivo adjunto
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

        // Verificar si la tarea y el adjunto existen
        const tarea = await Tarea.findByPk(tareaId);
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        const adjunto = await Adjunto.findByPk(archivoId);
        if (!adjunto) {
            return res.status(404).json({ error: 'Adjunto no encontrado' });
        }

        // Eliminar el archivo adjunto
        await adjunto.destroy();

        res.json({ mensaje: 'Adjunto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el adjunto', detalle: error.message });
    }
};
