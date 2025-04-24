const Proyecto = require('../../modelos/proyecto.modelo');
const Tarea = require('../../modelos/tarea.modelo');

async function actualizarProgresoProyecto(proyectoId) {
  try {
    const totalTareas = await Tarea.count({ where: { proyecto_id: proyectoId } });

    if (totalTareas === 0) {
      await Proyecto.update({ progreso: 0 }, { where: { id: proyectoId } });
      return;
    }

    const tareasFinalizadas = await Tarea.count({
      where: {
        proyecto_id: proyectoId,
        estado: 'Finalizado'
      }
    });

    const progreso = (tareasFinalizadas / totalTareas) * 100;

    await Proyecto.update(
      { progreso: progreso.toFixed(2) },
      { where: { id: proyectoId } }
    );
  } catch (error) {
    console.error('❌ Error al actualizar progreso del proyecto:', error);
  }
}

module.exports = actualizarProgresoProyecto;
