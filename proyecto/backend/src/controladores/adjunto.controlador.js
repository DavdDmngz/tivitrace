const fs = require('fs');
const path = require('path');
const { Tarea } = require('../modelos/tarea.modelo');
const Adjunto = require('../modelos/adjunto.modelo');

// Subir un archivo
exports.subirArchivo = async (req, res) => {
  const { id } = req.params;
  const archivo = req.file;

  try {
    if (!archivo) return res.status(400).json({ error: 'No se ha subido ningún archivo' });

    const tarea = await Tarea.findByPk(id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    const adjunto = await Adjunto.create({
      tarea_id: id,
      nombre_archivo: archivo.filename,
      ruta_archivo: archivo.path,
      fecha_subida: new Date()
    });

    res.status(201).json({
      mensaje: 'Archivo subido correctamente',
      adjunto
    });
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Editar un archivo
exports.editarArchivo = async (req, res) => {
  const { tareaId, archivoId } = req.params;
  const archivoNuevo = req.file;

  try {
    if (!archivoNuevo) return res.status(400).json({ error: 'No se ha subido ningún archivo' });

    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    const adjuntoExistente = await Adjunto.findByPk(archivoId);
    if (!adjuntoExistente) return res.status(404).json({ error: 'Archivo no encontrado' });

    // Eliminar archivo anterior del sistema
    if (fs.existsSync(adjuntoExistente.ruta_archivo)) {
      fs.unlinkSync(adjuntoExistente.ruta_archivo);
    }

    await adjuntoExistente.update({
      nombre_archivo: archivoNuevo.filename,
      ruta_archivo: archivoNuevo.path,
      fecha_subida: new Date()
    });

    res.status(200).json({
      mensaje: 'Archivo actualizado correctamente',
      adjunto: adjuntoExistente
    });
  } catch (error) {
    console.error('Error al editar el archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar archivo
exports.eliminarArchivo = async (req, res) => {
  const { tareaId, archivoId } = req.params;

  try {
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    const adjunto = await Adjunto.findByPk(archivoId);
    if (!adjunto) return res.status(404).json({ error: 'Archivo no encontrado' });

    // Eliminar archivo del sistema
    if (fs.existsSync(adjunto.ruta_archivo)) {
      fs.unlinkSync(adjunto.ruta_archivo);
    }

    await adjunto.destroy();

    res.status(200).json({ mensaje: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
