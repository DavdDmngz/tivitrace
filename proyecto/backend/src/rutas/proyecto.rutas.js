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
    validarRol(['administrador', 'supervisor']),
    proyectoControlador.obtenerProyectos
);

// 📌 Obtener un proyecto por ID (solo administrador y supervisor)
router.get(
    '/:id',
    [
        validarAutenticacion,
        validarRol(['administrador', 'supervisor']),
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
            .isString().withMessage('La descripción debe ser una cadena de texto'),
        body('progreso')
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage('El progreso debe estar entre 0 y 100')
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
        body('progreso')
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage('El progreso debe estar entre 0 y 100')
    ],
    validarCampos,
    proyectoControlador.actualizarProyecto
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