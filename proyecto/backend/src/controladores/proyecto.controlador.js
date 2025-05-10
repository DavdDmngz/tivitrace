const Proyecto = require('../modelos/proyecto.modelo');
const Tarea = require('../modelos/tarea.modelo');
const Participante = require('../modelos/participante.modelo');

// Obtener todos los proyectos con sus tareas
exports.obtenerProyectos = async (req, res) => {
    try {
        const usuario = req.user;
        console.log('Usuario:', usuario);

        let proyectos;

        const roles = usuario.roles || [];
        const esAdmin = roles.some(r => r.nombre === 'administrador');

        if (esAdmin) {
            proyectos = await Proyecto.findAll({
                include: [{ model: Tarea, as: 'tareas' }]
            });
        } else {
            proyectos = await Proyecto.findAll({
                include: [
                    { model: Tarea, as: 'tareas' },
                    {
                        model: Participante,
                        as: 'participantes',
                        where: { usuario_id: usuario.id },
                        attributes: [],
                    },
                ]
            });
        }

        res.json(proyectos);
    } catch (error) {
        console.error('Error al obtener los proyectos:', error);
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

// Crear un nuevo proyecto
exports.crearProyecto = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const nuevoProyecto = await Proyecto.create({
            nombre,
            descripcion,
            estado: 'en_progreso',
            progreso: 0,
            fecha_creacion: new Date(),
            fecha_fin: null
        });

        res.status(201).json(nuevoProyecto);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el proyecto', detalle: error.message });
    }
};

// Actualizar un proyecto
exports.actualizarProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, fecha_fin, estado } = req.body;

        const proyecto = await Proyecto.findByPk(id);
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        await proyecto.update({
            nombre,
            descripcion,
            fecha_fin: fecha_fin === undefined ? null : fecha_fin,
            estado
        });

        res.json(proyecto);
    } catch (error) {
        console.error('Error al actualizar el proyecto:', error);
        res.status(500).json({ error: 'Error al actualizar el proyecto', detalle: error.message });
    }
};

// Finalizar un proyecto
exports.finalizarProyecto = async (req, res) => {
    try {
        const { id } = req.params;

        const proyecto = await Proyecto.findByPk(id);
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        await proyecto.update({
            estado: 'finalizado',
            fecha_fin: new Date(),
            progreso: 100
        });

        res.json({ mensaje: 'Proyecto finalizado correctamente', proyecto });
    } catch (error) {
        res.status(500).json({ error: 'Error al finalizar el proyecto', detalle: error.message });
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
