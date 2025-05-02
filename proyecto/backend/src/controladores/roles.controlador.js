const Roles = require('../modelos/rol.modelo');

const RolesController = {
    async listarRoles(req, res) {
        try {
            const roles = await Roles.findAll();
            res.status(200).json(roles);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los roles', detalle: error.message });
        }
    },

    async obtenerRol(req, res) {
        try {
            const { id } = req.params;
            const rol = await Roles.findByPk(id);
            if (!rol) {
                return res.status(404).json({ error: 'Rol no encontrado' });
            }
            // Solo devolver el nombre
            res.status(200).json({ nombre: rol.nombre });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el rol', detalle: error.message });
        }
    },

    async crearRol(req, res) {
        try {
            const { nombre } = req.body;
            const nuevoRol = await Roles.create({ nombre });
            res.status(201).json(nuevoRol);
        } catch (error) {
            res.status(400).json({ error: 'Error al crear el rol', detalle: error.message });
        }
    },

    async actualizarRol(req, res) {
        try {
            const { id } = req.params;
            const { nombre } = req.body;
            const rol = await Roles.findByPk(id);
            if (!rol) {
                return res.status(404).json({ error: 'Rol no encontrado' });
            }
            await rol.update({ nombre });
            res.status(200).json(rol);
        } catch (error) {
            res.status(400).json({ error: 'Error al actualizar el rol', detalle: error.message });
        }
    },

    async eliminarRol(req, res) {
        try {
            const { id } = req.params;
            const rol = await Roles.findByPk(id);
            if (!rol) {
                return res.status(404).json({ error: 'Rol no encontrado' });
            }
            await rol.destroy();
            res.status(200).json({ mensaje: 'Rol eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el rol', detalle: error.message });
        }
    }
};

module.exports = RolesController;
