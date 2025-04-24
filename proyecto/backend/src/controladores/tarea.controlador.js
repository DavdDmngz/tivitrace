const Tarea = require('../modelos/tarea.modelo');
const Proyecto = require('../modelos/proyecto.modelo');
const Adjunto = require('../modelos/adjunto.modelo');
const  actualizarProgresoProyecto  = require('../core/helpers/update_proyect.helper');

// Obtener todas las tareas
exports.obtenerTareas = async (req, res) => {
    try {
        const tareas = await Tarea.findAll({
            include: { model: Proyecto, as: 'proyecto' }
        });
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las tareas', detalle: error.message });
    }
};

// Obtener una tarea por ID
exports.obtenerTareaPorId = async (req, res) => {
    try {
        const tarea = await Tarea.findByPk(req.params.id, {
            include: { model: Proyecto, as: 'proyecto' }
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
        const nuevaTarea = await Tarea.create(req.body);

        // Actualiza el progreso del proyecto
        await actualizarProgresoProyecto(nuevaTarea.proyecto_id);

        res.status(201).json(nuevaTarea);
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

        await tarea.update(req.body);

        // Actualiza el progreso del proyecto
        await actualizarProgresoProyecto(tarea.proyecto_id);

        res.json({ mensaje: 'Tarea actualizada correctamente', tarea });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la tarea', detalle: error.message });
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

        // Actualiza el progreso del proyecto
        await actualizarProgresoProyecto(proyectoId);

        res.json({ mensaje: 'Tarea eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea', detalle: error.message });
    }
};

exports.subirAdjunto = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
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
