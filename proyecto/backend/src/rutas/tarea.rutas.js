const express = require('express');
const { body, param, validationResult } = require('express-validator');
const tareaControlador = require('../controladores/tarea.controlador');
const adjuntoControlador = require('../controladores/adjunto.controlador');
const { validarAutenticacion, validarRol } = require('../core/config/passport.config');
const upload = require('../core/middlewares/multer.middleware');

const router = express.Router();

// Middleware para validar campos
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

// Obtener todas las tareas
router.get(
    '/',
    validarAutenticacion,
    tareaControlador.obtenerTareas
);

// Obtener una tarea por ID
router.get(
    '/:id',
    validarAutenticacion,
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    tareaControlador.obtenerTareaPorId
);

// Crear una nueva tarea
router.post(
    '/',
    validarAutenticacion,
    validarRol(['administrador', 'supervisor']),
    [
        body('nombre')
            .notEmpty().withMessage('El nombre es obligatorio')
            .isString().withMessage('El nombre debe ser una cadena de texto'),
        body('descripcion')
            .optional()
            .isString().withMessage('La descripción debe ser una cadena de texto'),
        body('estado')
            .optional()
            .isString().withMessage('El estado debe ser una cadena de texto')
            .custom((value) => {
                const estado = value.trim().toLowerCase();
                if (!['sin_comenzar', 'en_proceso', 'pendiente', 'finalizado'].includes(estado)) {
                    throw new Error('Estado inválido');
                }
                return true;
            }),
        body('proyecto_id')
            .notEmpty().withMessage('El ID del proyecto es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID del proyecto debe ser un número entero positivo')
    ],
    validarCampos,
    tareaControlador.crearTarea
);

// Actualizar una tarea
router.put(
    '/:id',
    validarAutenticacion,
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
        body('nombre')
            .optional()
            .isString().withMessage('El nombre debe ser una cadena de texto'),
        body('descripcion')
            .optional()
            .isString().withMessage('La descripción debe ser una cadena de texto'),
        body('estado')
            .optional()
            .isString().withMessage('El estado debe ser una cadena de texto')
            .custom((value) => {
                const estado = value.trim().toLowerCase();
                if (!['sin_comenzar', 'en_proceso', 'pendiente', 'finalizado'].includes(estado)) {
                    throw new Error('Estado inválido');
                }
                return true;
            }),
        body('proyecto_id')
            .optional()
            .isInt({ min: 1 }).withMessage('El ID del proyecto debe ser un número entero positivo')
    ],
    validarCampos,
    tareaControlador.actualizarTarea
);

// Eliminar una tarea
router.delete(
    '/:id',
    validarAutenticacion,
    validarRol(['administrador', 'supervisor']),
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    tareaControlador.eliminarTarea
);

// Cambiar solo el estado de una tarea (Drag and Drop)
router.patch(
    '/:id/estado',
    validarAutenticacion,
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
        body('estado')
            .notEmpty().withMessage('El estado es obligatorio')
            .isString().withMessage('El estado debe ser una cadena de texto')
            .custom((value) => {
                const estado = value.trim().toLowerCase();
                if (!['sin_comenzar', 'en_proceso', 'pendiente', 'finalizado'].includes(estado)) {
                    throw new Error('Estado inválido');
                }
                return true;
            }),
    ],
    validarCampos,
    tareaControlador.cambiarEstadoTarea
);

// Adjuntos

// Subir adjuntos a una tarea (varios archivos)
router.post(
    '/:id/adjuntos',
    validarAutenticacion,
    upload.array('file'),
    [
        param('id')
            .notEmpty().withMessage('El ID de la tarea es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    adjuntoControlador.subirAdjunto
);

// Obtener adjuntos de una tarea
router.get(
    '/:id/adjuntos',
    validarAutenticacion,
    [
        param('id')
            .notEmpty().withMessage('El ID de la tarea es obligatorio')
            .isInt({ min: 1 }).withMessage('Debe ser un número entero positivo')
    ],
    validarCampos,
    adjuntoControlador.obtenerAdjuntosPorTarea
);

// Editar un adjunto
router.put(
    '/:tareaId/adjuntos/:archivoId',
    validarAutenticacion,
    upload.single('file'),
    [
        param('tareaId')
            .notEmpty().withMessage('El ID de la tarea es obligatorio')
            .isInt({ min: 1 }).withMessage('Debe ser un número entero positivo'),
        param('archivoId')
            .notEmpty().withMessage('El ID del archivo es obligatorio')
            .isInt({ min: 1 }).withMessage('Debe ser un número entero positivo')
    ],
    validarCampos,
    adjuntoControlador.editarAdjunto
);

// Eliminar un adjunto
router.delete(
    '/:tareaId/adjuntos/:archivoId',
    validarAutenticacion,
    [
        param('tareaId')
            .notEmpty().withMessage('El ID de la tarea es obligatorio')
            .isInt({ min: 1 }).withMessage('Debe ser un número entero positivo'),
        param('archivoId')
            .notEmpty().withMessage('El ID del archivo es obligatorio')
            .isInt({ min: 1 }).withMessage('Debe ser un número entero positivo')
    ],
    validarCampos,
    adjuntoControlador.eliminarAdjunto
);

module.exports = router;
