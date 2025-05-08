const Participante = require('../modelos/participante.modelo');
const Usuario = require('../modelos/usuario.modelo');
const Proyecto = require('../modelos/proyecto.modelo');
const Tarea = require('../modelos/tarea.modelo');

// Obtener todos los participantes (opcionalmente filtrado por proyecto o tarea)
exports.obtenerParticipantes = async (req, res) => {
    try {
        const { proyecto_id, tarea_id } = req.query;
        const filtro = {};
        if (proyecto_id) filtro.proyecto_id = proyecto_id;
        if (tarea_id) filtro.tarea_id = tarea_id;

        const participantes = await Participante.findAll({
            where: filtro,
            include: [
                { model: Usuario, as: 'usuario' },
                { model: Proyecto, as: 'proyecto' },
                { model: Tarea, as: 'tarea' }
            ]
        });

        res.json(participantes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los participantes' });
    }
};

exports.obtenerUsuariosParticipantes = async (req, res) => {
    try {
        const { proyecto_id, tarea_id } = req.query;

        if (!proyecto_id || !tarea_id) {
            return res.status(400).json({ mensaje: 'Se requieren proyecto_id y tarea_id' });
        }

        const participantes = await Participante.findAll({
            where: {
                proyecto_id,
                tarea_id
            },
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['id', 'nombre', 'apellido', 'correo']
                }
            ]
        });

        const usuarios = participantes
            .filter(p => p.usuario)
            .map(p => p.usuario);

        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios participantes:', error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios participantes' });
    }
};

// Obtener un participante por ID
exports.obtenerParticipantePorId = async (req, res) => {
    try {
        const participante = await Participante.findByPk(req.params.id, {
            include: [
                { model: Usuario, as: 'usuario' },
                { model: Proyecto, as: 'proyecto' },
                { model: Tarea, as: 'tarea' }
            ]
        });

        if (!participante) {
            return res.status(404).json({ error: 'Participante no encontrado' });
        }

        res.json(participante);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el participante', detalle: error.message });
    }
};

// Crear un nuevo participante
exports.crearParticipante = async (req, res) => {
    try {
        const { usuario_id, proyecto_id, tarea_id } = req.body;

        if (!usuario_id || !proyecto_id || !tarea_id) {
            return res.status(400).json({ error: 'usuario_id, proyecto_id y tarea_id son obligatorios' });
        }

        const nuevoParticipante = await Participante.create({
            usuario_id,
            proyecto_id,
            tarea_id
        });

        res.status(201).json({ mensaje: 'Participante creado exitosamente', participante: nuevoParticipante });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el participante', detalle: error.message });
    }
};

// Actualizar un participante
exports.actualizarParticipante = async (req, res) => {
    try {
        const participante = await Participante.findByPk(req.params.id);
        if (!participante) {
            return res.status(404).json({ error: 'Participante no encontrado' });
        }

        const { usuario_id, proyecto_id, tarea_id } = req.body;

        await participante.update({
            usuario_id: usuario_id || participante.usuario_id,
            proyecto_id: proyecto_id || participante.proyecto_id,
            tarea_id: tarea_id || participante.tarea_id
        });

        res.json({ mensaje: 'Participante actualizado correctamente', participante });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el participante', detalle: error.message });
    }
};

// Eliminar un participante
exports.eliminarParticipante = async (req, res) => {
    try {
        const participante = await Participante.findByPk(req.params.id);
        if (!participante) {
            return res.status(404).json({ error: 'Participante no encontrado' });
        }

        await participante.destroy();

        res.json({ mensaje: 'Participante eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el participante', detalle: error.message });
    }
};
