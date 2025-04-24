const Proyecto = require('../modelos/proyecto.modelo');
const Tarea = require('../modelos/tarea.modelo');

// Obtener todos los proyectos con sus tareas
exports.obtenerProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.findAll({
            include: [{ model: Tarea, as: 'tareas' }]
        });
        res.json(proyectos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los proyectos', detalle: error.message });
    }
};

// Obtener un proyecto por su ID
exports.obtenerProyectoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await Proyecto.findByPk(id, {
            include: [{ model: Tarea, as: 'tareas' }]
        });

        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        res.json(proyecto);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el proyecto', detalle: error.message });
    }
};

// Crear un nuevo proyecto (sin progreso manual)
exports.crearProyecto = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const nuevoProyecto = await Proyecto.create({ 
            nombre, 
            descripcion 
        });

        res.status(201).json(nuevoProyecto);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el proyecto', detalle: error.message });
    }
};

// Actualizar un proyecto (sin actualizar el progreso directamente)
exports.actualizarProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const proyecto = await Proyecto.findByPk(id);
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        await proyecto.update({ nombre, descripcion });
        res.json(proyecto);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el proyecto', detalle: error.message });
    }
};

// Eliminar un proyecto
exports.eliminarProyecto = async (req, res) => {
    try {
        const { id } = req.params;

        const proyecto = await Proyecto.findByPk(id);
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        await proyecto.destroy();
        res.json({ mensaje: 'Proyecto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el proyecto', detalle: error.message });
    }
};
