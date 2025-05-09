const express = require('express');
const { query, validationResult } = require('express-validator');
const reportesControlador = require('../controladores/reporte.controlador');
const { validarAutenticacion, validarRol } = require('../core/config/passport.config');

const router = express.Router();

// Middleware para manejar errores de validación
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

// 📌 Obtener estadísticas del dashboard (solo administrador y supervisor)
router.get(
    '/dashboard',
    validarAutenticacion,
    validarRol(['administrador', 'supervisor']),
    reportesControlador.dashboard
);

// 📌 Obtener reporte de usuarios por estado
router.get(
    '/usuarios-por-estado',
    validarAutenticacion,
    validarRol(['administrador', 'supervisor']),
    reportesControlador.usuariosPorEstado
);

// 📌 Obtener reporte de proyectos por fecha de creación
router.get(
    '/proyectos-por-fecha',
    [
        validarAutenticacion,
        query('startDate')
            .notEmpty().withMessage('La fecha de inicio es obligatoria')
            .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida (ISO8601)'),
        query('endDate')
            .notEmpty().withMessage('La fecha de fin es obligatoria')
            .isISO8601().withMessage('La fecha de fin debe ser una fecha válida (ISO8601)')
    ],
    validarCampos,
    reportesControlador.proyectosPorFecha
);

// 📌 Obtener reporte de tareas por proyecto
router.get(
    '/tareas-por-proyecto',
    validarAutenticacion,
    validarRol(['administrador', 'supervisor']),
    reportesControlador.tareasPorProyecto
);

// 📌 Obtener reporte de usuarios con más tareas asignadas
router.get(
    '/usuarios-con-mas-tareas',
    validarAutenticacion,
    validarRol(['administrador', 'supervisor']),
    reportesControlador.usuariosConMasTareas
);

// 📌 Obtener proyectos cercanos a la fecha de fin
router.get(
    '/proyectos-cerca-fecha-fin',
    validarAutenticacion,
    validarRol(['administrador', 'supervisor']),
    reportesControlador.proyectosCercaFechaFin
);

// 📌 Obtener promedio de tiempo de ejecución de tareas
router.get(
    '/promedio-tiempo-ejecucion',
    validarAutenticacion,
    validarRol(['administrador', 'supervisor']),
    reportesControlador.promedioTiempoEjecucion
);

module.exports = router;
