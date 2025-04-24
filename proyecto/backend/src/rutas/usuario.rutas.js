const express = require('express');
const { body, param, validationResult } = require('express-validator');
const usuarioController = require('../controladores/usuario.controlador');
const responseHelper = require('../core/helpers/response.helper');

const router = express.Router();

const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return responseHelper.enviar(400, responseHelper.errores(errores), res);
    }
    next();
};

// 📌 Crear usuario
router.post(
    '/',
    [
        body('nombre').notEmpty().withMessage('El nombre es obligatorio').isString().trim().escape(),
        body('apellido').notEmpty().withMessage('El apellido es obligatorio').isString().trim().escape(),
        body('correo').isEmail().withMessage('Debe ser un correo válido').notEmpty(),
        body('contrasena').notEmpty().withMessage('La contraseña es obligatoria').isLength({ min: 6 }),
        body('codigo_pais').notEmpty().withMessage('El código de país es obligatorio').isString().trim().escape(),
        body('telefono').notEmpty().withMessage('El teléfono es obligatorio').isString().trim().escape()
    ],
    validarCampos,
    usuarioController.crearUsuario
);

// Listar todos los usuarios
router.get('/', usuarioController.obtenerUsuarios);

// Obtener usuario por ID
router.get(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')],
    validarCampos,
    usuarioController.obtenerUsuarioPorId
);

// Actualizar usuario
router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
        body('nombre').optional().isString().trim().escape(),
        body('apellido').optional().isString().trim().escape(),
        body('correo').optional().isEmail().trim(),
        body('codigo_pais').optional().isString().trim().escape(),
        body('telefono').optional().isString().trim().escape()
    ],
    validarCampos,
    usuarioController.actualizarUsuario
);

// 📌 Eliminar usuario
router.delete(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')],
    validarCampos,
    usuarioController.eliminarUsuario
);

module.exports = router;