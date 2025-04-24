const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { validarAutenticacion, validarRol } = require('../core/config/passport.config');
const RolesController = require('../controladores/roles.controlador');
const responseHelper = require('../core/helpers/response.helper');

const router = express.Router();

// Middleware para validar campos
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return responseHelper.enviar(400, responseHelper.errores(errores), res);
    }
    next();
};

// Obtener todos los roles
router.get('/', RolesController.listarRoles);

// Obtener un rol por ID
router.get(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo'),
    ],
    validarCampos,
    RolesController.obtenerRol
);

// Crear nuevo rol
router.post(
    '/',
    [
        body('nombre')
            .notEmpty().withMessage('El nombre del rol es obligatorio')
            .isString().withMessage('El nombre del rol debe ser una cadena de texto')
            .trim().escape()
    ],
    validarCampos,
    RolesController.crearRol
);

// Actualizar rol
router.put(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo'),
        body('nombre')
            .optional()
            .isString().withMessage('El nombre debe ser una cadena de texto')
            .trim().escape()
    ],
    validarCampos,
    RolesController.actualizarRol
);

// Eliminar rol
router.delete(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo')
    ],
    validarCampos,
    RolesController.eliminarRol
);

module.exports = router;
