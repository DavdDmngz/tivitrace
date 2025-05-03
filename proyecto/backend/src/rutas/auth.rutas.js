const express = require('express');
const { body, param, validationResult } = require('express-validator');
const authController = require('../controladores/auth.controlador');
const responseHelper = require('../core/helpers/response.helper');
const router = express.Router();

// Función para validar los campos
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return responseHelper.enviar(400, responseHelper.errores(errores), res);
    }
    next();
};

// Iniciar sesión
router.post(
    '/login',
    [
        body('correo').isEmail().withMessage('Debe ser un correo válido').notEmpty(),
        body('contrasena').notEmpty().withMessage('La contraseña es obligatoria')
    ],
    validarCampos,
    authController.login
);

// Solicitar clave temporal (Recuperar contraseña)
router.post(
    '/recuperar-contrasena',
    [
        body('correo').isEmail().withMessage('Debe ser un correo válido').notEmpty(),
    ],
    validarCampos,
    authController.solicitarClaveTemporal
);

// Cambiar contraseña con código de recuperación
router.post(
    '/cambiar-contrasena',
    [
        body('correo').isEmail().withMessage('Debe ser un correo válido').notEmpty(),
        body('codigo').notEmpty().withMessage('El código de recuperación es obligatorio').isString(),
        body('nuevaContrasena')
            .notEmpty().withMessage('La nueva contraseña es obligatoria')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    ],
    validarCampos,
    authController.cambiarContrasena
);

// Ruta para renovar el token
router.post('/refresh', authController.refreshToken);

module.exports = router;