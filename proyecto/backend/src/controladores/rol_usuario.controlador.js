const RolUsuario = require('../modelos/rol_usuario.modelo');
const Usuario = require('../modelos/usuario.modelo');
const Rol = require('../modelos/rol.modelo');

const RolUsuarioController = {
    async listarAsignaciones(req, res) {
        try {
            const asignaciones = await RolUsuario.findAll({
                include: [Usuario, Rol]
            });
            res.status(200).json(asignaciones);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las asignaciones de roles', detalle: error.message });
        }
    },

    async obtenerAsignacion(req, res) {
        try {
            const { id } = req.params;
            const asignacion = await RolUsuario.findByPk(id, { include: [Usuario, Rol] });
            if (!asignacion) {
                return res.status(404).json({ error: 'Asignación no encontrada' });
            }
            res.status(200).json(asignacion);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener la asignación', detalle: error.message });
        }
    },

    async asignarRol(req, res) {
        try {
            const { usuario_id, rol_id } = req.body;
            const nuevaAsignacion = await RolUsuario.create({ usuario_id, rol_id });
            res.status(201).json(nuevaAsignacion);
        } catch (error) {
            res.status(400).json({ error: 'Error al asignar el rol', detalle: error.message });
        }
    },

    async actualizarAsignacion(req, res) {
        try {
            const { id } = req.params;
            const { usuario_id, rol_id } = req.body;
            const asignacion = await RolUsuario.findByPk(id);
            if (!asignacion) {
                return res.status(404).json({ error: 'Asignación no encontrada' });
            }
            await asignacion.update({ usuario_id, rol_id });
            res.status(200).json(asignacion);
        } catch (error) {
            res.status(400).json({ error: 'Error al actualizar la asignación', detalle: error.message });
        }
    },

    async eliminarAsignacion(req, res) {
        try {
            const { id } = req.params;
            const asignacion = await RolUsuario.findByPk(id);
            if (!asignacion) {
                return res.status(404).json({ error: 'Asignación no encontrada' });
            }
            await asignacion.destroy();
            res.status(200).json({ mensaje: 'Asignación eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar la asignación', detalle: error.message });
        }
    }
};

module.exports = RolUsuarioController;