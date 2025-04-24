const express = require('express');
const { body, param, validationResult } = require('express-validator');
const usuarioTareaController = require('../controladores/usuarioTarea.controlador');
const responseHelper = require('../core/helpers/response.helper');

const router = express.Router();

const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return responseHelper.enviar(400, responseHelper.errores(errores), res);
    }
    next();
};

router.post(
    '/',
    [
        body('usuario_id').isInt({ min: 1 }).withMessage('El ID de usuario debe ser un número entero positivo'),
        body('tarea_id').isInt({ min: 1 }).withMessage('El ID de tarea debe ser un número entero positivo')
    ],
    validarCampos,
    usuarioTareaController.asignarTarea
);

router.delete(
    '/',
    [
        body('usuario_id').isInt({ min: 1 }).withMessage('El ID de usuario debe ser un número entero positivo'),
        body('tarea_id').isInt({ min: 1 }).withMessage('El ID de tarea debe ser un número entero positivo')
    ],
    validarCampos,
    usuarioTareaController.eliminarAsignacion
);

router.get(
    '/usuario/:usuario_id',
    [
        param('usuario_id').isInt({ min: 1 }).withMessage('El ID de usuario debe ser un número entero positivo')
    ],
    validarCampos,
    usuarioTareaController.obtenerTareasPorUsuario
);
router.get(
    '/tarea/:tarea_id',
    [
        param('tarea_id').isInt({ min: 1 }).withMessage('El ID de tarea debe ser un número entero positivo')
    ],
    validarCampos,
    usuarioTareaController.obtenerUsuariosPorTarea
);

module.exports = router;