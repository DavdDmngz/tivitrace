const express = require('express');
const { body, param, validationResult } = require('express-validator');
const proyectoControlador = require('../controladores/proyecto.controlador');
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

// 📌 Obtener todos los proyectos (solo administrador y supervisor)
router.get(
    '/',
    validarAutenticacion,
    proyectoControlador.obtenerProyectos
);

// 📌 Obtener un proyecto por ID (solo administrador y supervisor)
router.get(
    '/:id',
    [
        validarAutenticacion,
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    proyectoControlador.obtenerProyectoPorId
);

// 📌 Crear un nuevo proyecto (solo administrador y supervisor)
router.post(
    '/',
    [
        validarAutenticacion,
        validarRol(['administrador', 'supervisor']),
        body('nombre')
            .notEmpty().withMessage('El nombre es obligatorio')
            .isString().withMessage('El nombre debe ser una cadena de texto'),
        body('descripcion')
            .optional()
            .isString().withMessage('La descripción debe ser una cadena de texto')
    ],
    validarCampos,
    proyectoControlador.crearProyecto
);

// 📌 Actualizar un proyecto (solo administrador y supervisor)
router.put(
    '/:id',
    [
        validarAutenticacion,
        validarRol(['administrador', 'supervisor']),
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
        body('nombre')
            .notEmpty().withMessage('El nombre es obligatorio')
            .isString().withMessage('El nombre debe ser una cadena de texto'),
        body('descripcion')
            .optional()
            .isString().withMessage('La descripción debe ser una cadena de texto'),
        body('estado')
            .optional()
            .isIn(['en_progreso', 'finalizado']).withMessage('El estado debe ser "en_progreso" o "finalizado"'),
        body('fecha_fin')
            .optional()
            .isISO8601().withMessage('La fecha de fin debe tener un formato válido (ISO8601)')
    ],
    validarCampos,
    proyectoControlador.actualizarProyecto
);

// 📌 Finalizar un proyecto (solo administrador y supervisor)
router.put(
    '/:id/finalizar',
    [
        validarAutenticacion,
        validarRol(['administrador', 'supervisor']),
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    proyectoControlador.finalizarProyecto
);

// 📌 Eliminar un proyecto (solo administrador y supervisor)
router.delete(
    '/:id',
    [
        validarAutenticacion,
        validarRol(['administrador', 'supervisor']),
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    proyectoControlador.eliminarProyecto
);

module.exports = router;