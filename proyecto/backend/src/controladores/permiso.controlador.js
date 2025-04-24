const Permiso = require('../modelos/permiso.modelo');

const permisoController = {
    async crearPermiso(req, res) {
        try {
            const { nombre } = req.body;

            console.log(`🔍 Verificando si el permiso '${nombre}' ya existe...`);
            const permisoExistente = await Permiso.findOne({ where: { nombre } });

            if (permisoExistente) {
                console.log("🚫 Permiso ya existente.");
                return res.status(400).json({ mensaje: "El permiso ya existe" });
            }

            const permiso = await Permiso.create({ nombre });
            console.log(`✅ Permiso creado: ${permiso.nombre}`);

            res.status(201).json(permiso);
        } catch (error) {
            console.error("❌ Error al crear permiso:", error);
            res.status(500).json({ mensaje: "Error al crear permiso", error });
        }
    },

    async obtenerPermisos(req, res) {
        try {
            console.log("📜 Consultando todos los permisos...");
            const permisos = await Permiso.findAll();
            console.log("✅ Permisos obtenidos correctamente.");

            res.json(permisos);
        } catch (error) {
            console.error("❌ Error al obtener permisos:", error);
            res.status(500).json({ mensaje: "Error al obtener permisos", error });
        }
    },

    async obtenerPermisoPorId(req, res) {
        try {
            const { id } = req.params;
            console.log(`🔍 Buscando permiso con ID: ${id}...`);

            const permiso = await Permiso.findByPk(id);
            if (!permiso) {
                console.log("🚫 Permiso no encontrado.");
                return res.status(404).json({ mensaje: "Permiso no encontrado" });
            }

            console.log(`✅ Permiso encontrado: ${permiso.nombre}`);
            res.json(permiso);
        } catch (error) {
            console.error("❌ Error al obtener el permiso:", error);
            res.status(500).json({ mensaje: "Error al obtener el permiso", error });
        }
    },

    async actualizarPermiso(req, res) {
        try {
            const { id } = req.params;
            const { nombre } = req.body;
            console.log(`🔄 Buscando permiso ID: ${id} para actualizar...`);

            const permiso = await Permiso.findByPk(id);
            if (!permiso) {
                console.log("🚫 Permiso no encontrado.");
                return res.status(404).json({ mensaje: "Permiso no encontrado" });
            }

            permiso.nombre = nombre;
            await permiso.save();
            console.log(`✅ Permiso actualizado: ${nombre}`);

            res.json(permiso);
        } catch (error) {
            console.error("❌ Error al actualizar el permiso:", error);
            res.status(500).json({ mensaje: "Error al actualizar el permiso", error });
        }
    },

    async eliminarPermiso(req, res) {
        try {
            const { id } = req.params;
            console.log(`🗑️ Eliminando permiso ID: ${id}...`);

            const permiso = await Permiso.findByPk(id);
            if (!permiso) {
                console.log("🚫 Permiso no encontrado.");
                return res.status(404).json({ mensaje: "Permiso no encontrado" });
            }

            await permiso.destroy();
            console.log(`✅ Permiso eliminado: ${id}`);

            res.json({ mensaje: "Permiso eliminado correctamente" });
        } catch (error) {
            console.error("❌ Error al eliminar el permiso:", error);
            res.status(500).json({ mensaje: "Error al eliminar el permiso", error });
        }
    }
};

module.exports = permisoController;