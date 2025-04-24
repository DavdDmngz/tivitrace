const express = require('express');
const { body, param, validationResult } = require('express-validator');
const rolPermisoController = require('../controladores/rol_permiso.controlador');

const router = express.Router();

// Middleware para manejar errores de validación
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

// Asignar un permiso a un rol
router.post(
    '/asignar',
    [
        body('rol_id')
            .notEmpty().withMessage('El rol_id es obligatorio')
            .isInt({ min: 1 }).withMessage('El rol_id debe ser un número entero positivo'),
        body('permiso_id')
            .notEmpty().withMessage('El permiso_id es obligatorio')
            .isInt({ min: 1 }).withMessage('El permiso_id debe ser un número entero positivo')
    ],
    validarCampos,
    rolPermisoController.asignarPermiso
);

// Obtener los permisos de un rol
router.get(
    '/:rol_id/permisos',
    [
        param('rol_id')
            .notEmpty().withMessage('El rol_id es obligatorio')
            .isInt({ min: 1 }).withMessage('El rol_id debe ser un número entero positivo')
    ],
    validarCampos,
    rolPermisoController.obtenerPermisosDeRol
);

// Eliminar un permiso de un rol
router.delete(
    '/:rol_id/permisos/:permiso_id',
    [
        param('rol_id')
            .notEmpty().withMessage('El rol_id es obligatorio')
            .isInt({ min: 1 }).withMessage('El rol_id debe ser un número entero positivo'),
        param('permiso_id')
            .notEmpty().withMessage('El permiso_id es obligatorio')
            .isInt({ min: 1 }).withMessage('El permiso_id debe ser un número entero positivo')
    ],
    validarCampos,
    rolPermisoController.eliminarPermisoDeRol
);

module.exports = router;