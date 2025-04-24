const RolPermiso = require('../modelos/rol_permiso.modelo');
const Rol = require('../modelos/rol.modelo');
const Permiso = require('../modelos/permiso.modelo');

const rolPermisoController = {
    async asignarPermiso(req, res) {
        try {
            const { rol_id, permiso_id } = req.body;

            console.log(`🔍 Verificando si el rol (${rol_id}) y el permiso (${permiso_id}) existen...`);
            const rol = await Rol.findByPk(rol_id);
            const permiso = await Permiso.findByPk(permiso_id);

            if (!rol) {
                console.log("🚫 Rol no encontrado.");
                return res.status(404).json({ mensaje: "Rol no encontrado" });
            }

            if (!permiso) {
                console.log("🚫 Permiso no encontrado.");
                return res.status(404).json({ mensaje: "Permiso no encontrado" });
            }

            console.log("🔍 Verificando si el permiso ya está asignado...");
            const existeRelacion = await RolPermiso.findOne({ where: { rol_id, permiso_id } });
            if (existeRelacion) {
                console.log("🚫 El permiso ya está asignado a este rol.");
                return res.status(400).json({ mensaje: "El permiso ya está asignado a este rol" });
            }

            const rolPermiso = await RolPermiso.create({ rol_id, permiso_id });
            console.log(`✅ Permiso (${permiso_id}) asignado al rol (${rol_id}).`);

            res.status(201).json({ mensaje: "Permiso asignado al rol correctamente", rolPermiso });
        } catch (error) {
            console.error("❌ Error al asignar permiso al rol:", error);
            res.status(500).json({ mensaje: "Error al asignar permiso al rol", error: error.message });
        }
    },

    async obtenerPermisosDeRol(req, res) {
        try {
            const { rol_id } = req.params;

            console.log(`📜 Obteniendo permisos del rol (${rol_id})...`);
            const rol = await Rol.findByPk(rol_id, {
                include: {
                    model: Permiso,
                    through: { attributes: [] } // Evita mostrar la tabla intermedia
                }
            });

            if (!rol) {
                console.log("🚫 Rol no encontrado.");
                return res.status(404).json({ mensaje: "Rol no encontrado" });
            }

            console.log(`✅ Permisos obtenidos para el rol (${rol_id}).`);
            res.json(rol.Permisos); // Sequelize pluraliza automáticamente las asociaciones
        } catch (error) {
            console.error("❌ Error al obtener permisos del rol:", error);
            res.status(500).json({ mensaje: "Error al obtener permisos del rol", error: error.message });
        }
    },

    async eliminarPermisoDeRol(req, res) {
        try {
            const { rol_id, permiso_id } = req.params;
            console.log(`🗑️ Eliminando permiso (${permiso_id}) del rol (${rol_id})...`);

            const rolPermiso = await RolPermiso.findOne({ where: { rol_id, permiso_id } });

            if (!rolPermiso) {
                console.log("🚫 Relación rol-permiso no encontrada.");
                return res.status(404).json({ mensaje: "Relación rol-permiso no encontrada" });
            }

            await rolPermiso.destroy();
            console.log(`✅ Permiso (${permiso_id}) eliminado del rol (${rol_id}).`);

            res.json({ mensaje: "Permiso eliminado del rol correctamente" });
        } catch (error) {
            console.error("❌ Error al eliminar el permiso del rol:", error);
            res.status(500).json({ mensaje: "Error al eliminar el permiso del rol", error: error.message });
        }
    }
};

module.exports = rolPermisoController;