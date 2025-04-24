const UsuarioTarea = require('../modelos/usuario_tarea.modelo');
const Usuario = require('../modelos/usuario.modelo');
const Tarea = require('../modelos/tarea.modelo');

const UsuarioTareaControlador = {
    // Obtener todas las asignaciones
    async listar(req, res) {
        try {
            const asignaciones = await UsuarioTarea.findAll({
                include: [Usuario, Tarea]
            });
            res.json(asignaciones);
        } catch (error) {
            console.error("Error al obtener asignaciones:", error);
            res.status(500).json({ mensaje: "Error al obtener asignaciones" });
        }
    },

    // Asignar tarea a un usuario
    async asignar(req, res) {
        const { usuario_id, tarea_id } = req.body;

        try {
            const asignacion = await UsuarioTarea.create({ usuario_id, tarea_id });
            res.status(201).json({ mensaje: "Tarea asignada exitosamente", asignacion });
        } catch (error) {
            console.error("Error al asignar tarea:", error);
            res.status(500).json({ mensaje: "Error al asignar tarea" });
        }
    },

    // Obtener tareas asignadas a un usuario específico
    async tareasPorUsuario(req, res) {
        const { usuario_id } = req.params;

        try {
            const tareas = await UsuarioTarea.findAll({
                where: { usuario_id },
                include: [Tarea]
            });
            res.json(tareas);
        } catch (error) {
            console.error("Error al obtener tareas del usuario:", error);
            res.status(500).json({ mensaje: "Error al obtener tareas del usuario" });
        }
    },

    // Eliminar asignación usuario-tarea
    async eliminar(req, res) {
        const { usuario_id, tarea_id } = req.params;

        try {
            const eliminada = await UsuarioTarea.destroy({
                where: { usuario_id, tarea_id }
            });

            if (eliminada) {
                res.json({ mensaje: "Asignación eliminada correctamente" });
            } else {
                res.status(404).json({ mensaje: "Asignación no encontrada" });
            }
        } catch (error) {
            console.error("Error al eliminar asignación:", error);
            res.status(500).json({ mensaje: "Error al eliminar asignación" });
        }
    }
};

module.exports = UsuarioTareaControlador;