const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const participanteControlador = require('../controladores/participante.controlador');
const { validarAutenticacion, validarRol } = require('../core/config/passport.config');

const router = express.Router();

// Middleware para validar campos
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

// Obtener todos los participantes (opcionalmente filtrado por proyecto o tarea)
router.get(
    '/',
    validarAutenticacion,
    validarRol(['administrador', 'gestor']),
    [
        query('proyecto_id')
            .optional()
            .isInt({ min: 1 }).withMessage('El ID del proyecto debe ser un número entero positivo'),
        query('tarea_id')
            .optional()
            .isInt({ min: 1 }).withMessage('El ID de la tarea debe ser un número entero positivo'),
    ],
    validarCampos,
    participanteControlador.obtenerParticipantes
);

router.get(
    '/usuarios',
    validarAutenticacion,
    validarRol(['administrador', 'gestor']),
    [
        query('proyecto_id')
            .exists().withMessage('El ID del proyecto es obligatorio')
            .isInt({ min: 1 }).withMessage('Debe ser un número positivo'),
        query('tarea_id')
            .exists().withMessage('El ID de la tarea es obligatorio')
            .isInt({ min: 1 }).withMessage('Debe ser un número positivo'),
    ],
    validarCampos,
    participanteControlador.obtenerUsuariosParticipantes
);

// Obtener un participante por ID
router.get(
    '/:id',
    validarAutenticacion,
    validarRol(['administrador', 'gestor']),
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    participanteControlador.obtenerParticipantePorId
);

// Crear un nuevo participante
router.post(
    '/',
    validarAutenticacion,
    validarRol(['administrador', 'gestor']),
    [
        body('usuario_id')
            .notEmpty().withMessage('El usuario_id es obligatorio')
            .isInt({ min: 1 }).withMessage('El usuario_id debe ser un número entero positivo'),
        body('proyecto_id')
            .notEmpty().withMessage('El proyecto_id es obligatorio')
            .isInt({ min: 1 }).withMessage('El proyecto_id debe ser un número entero positivo'),
        body('tarea_id')
            .notEmpty().withMessage('El tarea_id es obligatorio')
            .isInt({ min: 1 }).withMessage('El tarea_id debe ser un número entero positivo'),
    ],
    validarCampos,
    participanteControlador.crearParticipante
);

// Actualizar un participante
router.put(
    '/:id',
    validarAutenticacion,
    validarRol(['administrador', 'gestor']),
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
        body('usuario_id')
            .optional()
            .isInt({ min: 1 }).withMessage('El usuario_id debe ser un número entero positivo'),
        body('proyecto_id')
            .optional()
            .isInt({ min: 1 }).withMessage('El proyecto_id debe ser un número entero positivo'),
        body('tarea_id')
            .optional()
            .isInt({ min: 1 }).withMessage('El tarea_id debe ser un número entero positivo'),
    ],
    validarCampos,
    participanteControlador.actualizarParticipante
);

// Eliminar un participante
router.delete(
    '/:id',
    validarAutenticacion,
    validarRol(['administrador']),
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    participanteControlador.eliminarParticipante
);

module.exports = router;
