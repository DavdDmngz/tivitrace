const express = require('express');
const { body, param, validationResult } = require('express-validator');
const RolUsuarioController = require('../controladores/rol_usuario.controlador');
const responseHelper = require('../core/helpers/response.helper');

const router = express.Router();

// Middleware para validar errores de campos
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return responseHelper.enviar(400, responseHelper.errores(errores), res);
    }
    next();
};

// 📌 Listar todas las asignaciones
router.get('/', RolUsuarioController.listarAsignaciones);

// 📌 Obtener una asignación por ID
router.get(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo'),
        validarCampos
    ],
    RolUsuarioController.obtenerAsignacion
);

// 📌 Asignar un rol a un usuario
router.post(
    '/',
    [
        body('usuario_id')
            .notEmpty().withMessage('El ID del usuario es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número entero positivo'),
        body('rol_id')
            .notEmpty().withMessage('El ID del rol es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID del rol debe ser un número entero positivo'),
        validarCampos
    ],
    RolUsuarioController.asignarRol
);

// 📌 Actualizar una asignación
router.put(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo'),
        body('usuario_id')
            .optional()
            .isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número entero positivo'),
        body('rol_id')
            .optional()
            .isInt({ min: 1 }).withMessage('El ID del rol debe ser un número entero positivo'),
        validarCampos
    ],
    RolUsuarioController.actualizarAsignacion
);

// 📌 Eliminar una asignación
router.delete(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo'),
        validarCampos
    ],
    RolUsuarioController.eliminarAsignacion
);

module.exports = router;