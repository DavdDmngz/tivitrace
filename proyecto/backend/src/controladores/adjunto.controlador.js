const Adjunto = require('../modelos/adjunto.modelo');
const Tarea = require('../modelos/tarea.modelo');

// Obtener todos los adjuntos de una tarea
exports.obtenerAdjuntosPorTarea = async (req, res) => {
  try {
    const { id } = req.params;

    const tarea = await Tarea.findByPk(id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const adjuntos = await Adjunto.findAll({
      where: { tarea_id: id }
    });

    res.json(adjuntos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los adjuntos', detalle: error.message });
  }
};

// Subir adjuntos a una tarea (varios archivos)
exports.subirAdjunto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const tarea = await Tarea.findByPk(id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const archivosSubidos = [];

    for (let file of req.files) {
      const adjunto = await Adjunto.create({
        tarea_id: id,
        nombre_archivo: file.originalname,
        ruta_archivo: file.path,
        fecha_subida: new Date()
      });
      archivosSubidos.push(adjunto);
    }

    res.status(201).json({ mensaje: 'Archivos subidos correctamente', adjuntos: archivosSubidos });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir los archivos', detalle: error.message });
  }
};

// Editar un adjunto
exports.editarAdjunto = async (req, res) => {
  try {
    const { tareaId, archivoId } = req.params;

    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const adjunto = await Adjunto.findByPk(archivoId);
    if (!adjunto) {
      return res.status(404).json({ error: 'Adjunto no encontrado' });
    }

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

    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const adjunto = await Adjunto.findByPk(archivoId);
    if (!adjunto) {
      return res.status(404).json({ error: 'Adjunto no encontrado' });
    }

    await adjunto.destroy();

    res.json({ mensaje: 'Adjunto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el adjunto', detalle: error.message });
  }
};
