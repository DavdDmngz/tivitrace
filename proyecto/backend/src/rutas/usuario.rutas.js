const express = require('express');
const { body, param, validationResult } = require('express-validator');
const usuarioController = require('../controladores/usuario.controlador');
const responseHelper = require('../core/helpers/response.helper');
const upload = require('../core/config/files.config');

const router = express.Router();

// Validar campos
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return responseHelper.enviar(400, responseHelper.errores(errores), res);
    }
    next();
};

// Crear usuario
router.post(
    '/',
    [
        body('nombre').notEmpty().isString().trim().escape(),
        body('apellido').notEmpty().isString().trim().escape(),
        body('correo').isEmail().notEmpty(),
        body('contrasena').notEmpty().isLength({ min: 6 }),
        body('codigo_pais').notEmpty().isString().trim().escape(),
        body('telefono').notEmpty().isString().trim().escape()
    ],
    validarCampos,
    usuarioController.crearUsuario
);

// Listar todos los usuarios
router.get('/', usuarioController.obtenerUsuarios);

// Obtener usuario por ID
router.get(
    '/:id',
    [param('id').isInt({ min: 1 })],
    validarCampos,
    usuarioController.obtenerUsuarioPorId
);

// Actualizar usuario (nombre, apellido, correo, etc., e imagen si hay)
router.put(
    '/:id',
    upload.single('img'),
    [
        param('id').isInt({ min: 1 }),
        body('nombre').optional().isString().trim().escape(),
        body('apellido').optional().isString().trim().escape(),
        body('correo').optional().isEmail().trim(),
        body('codigo_pais').optional().isString().trim().escape(),
        body('telefono').optional().isString().trim().escape()
    ],
    validarCampos,
    usuarioController.actualizarUsuario
);

// Eliminar usuario
router.delete(
    '/:id',
    [param('id').isInt({ min: 1 })],
    validarCampos,
    usuarioController.eliminarUsuario
);

// Actualizar solo imagen
router.post(
    '/:id/img',
    upload.single('img'),
    usuarioController.actualizarImagenUsuario
);

module.exports = router;
