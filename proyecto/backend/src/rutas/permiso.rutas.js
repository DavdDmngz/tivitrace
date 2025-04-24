const express = require('express');
const { body, param, validationResult } = require('express-validator');
const permisoController = require('../controladores/permiso.controlador');

const router = express.Router();

// Middleware para manejar errores de validación
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

// Crear un nuevo permiso
router.post(
    '/crear',
    [
        body('nombre')
            .notEmpty().withMessage('El nombre del permiso es obligatorio')
            .isString().withMessage('El nombre debe ser una cadena de texto')
            .matches(/^[a-zA-Z0-9\s]+$/).withMessage('El nombre no debe contener caracteres especiales'),
        body('descripcion')
            .optional()
            .isString().withMessage('La descripción debe ser una cadena de texto')
            .matches(/^[a-zA-Z0-9\s]+$/).withMessage('La descripción no debe contener caracteres especiales')
    ],
    validarCampos,
    permisoController.crearPermiso
);

// Obtener todos los permisos
router.get('/', permisoController.obtenerPermisos);

// Obtener un permiso por ID
router.get(
    '/buscar/:id',
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    permisoController.obtenerPermisoPorId
);

// Actualizar un permiso
router.put(
    '/actualizar/:id',
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
        body('nombre')
            .notEmpty().withMessage('El nombre del permiso es obligatorio')
            .isString().withMessage('El nombre debe ser una cadena de texto')
            .matches(/^[a-zA-Z0-9\s]+$/).withMessage('El nombre no debe contener caracteres especiales'),
        body('descripcion')
            .optional()
            .isString().withMessage('La descripción debe ser una cadena de texto')
            .matches(/^[a-zA-Z0-9\s]+$/).withMessage('La descripción no debe contener caracteres especiales')
    ],
    validarCampos,
    permisoController.actualizarPermiso
);

// Eliminar un permiso
router.delete(
    '/eliminar/:id',
    [
        param('id')
            .notEmpty().withMessage('El ID es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    permisoController.eliminarPermiso
);

module.exports = router;