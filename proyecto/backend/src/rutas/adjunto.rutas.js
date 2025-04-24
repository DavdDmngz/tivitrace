const express = require('express');
const { param, body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const AdjuntoControlador = require('../controladores/adjunto.controlador');
const responseHelper = require('../core/helpers/response.helper');

const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/adjuntos/'); // asegúrate de que esta carpeta exista
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombre = path.basename(file.originalname, ext).replace(/\s+/g, '_');
        cb(null, `${nombre}-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-rar-compressed',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

const upload = multer({ storage, fileFilter });

const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return responseHelper.enviar(400, responseHelper.errores(errores), res);
    }
    next();
};

// Obtener todos los adjuntos
router.get('/', AdjuntoControlador.obtenerAdjuntos);

// Obtener un adjunto por ID
router.get(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')],
    validarCampos,
    AdjuntoControlador.obtenerAdjuntoPorId
);

// Crear un nuevo adjunto (con archivo)
router.post(
    '/',
    upload.single('archivo'), // 'archivo' es el campo del formulario
    [
        body('tarea_id')
            .notEmpty().withMessage('El ID de la tarea es obligatorio')
            .isInt({ min: 1 }).withMessage('El ID de la tarea debe ser un número positivo'),
    ],
    validarCampos,
    AdjuntoControlador.crearAdjunto
);

// Actualizar un adjunto (opcionalmente con nuevo archivo)
router.put(
    '/:id',
    upload.single('archivo'),
    [
        param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
        body('tarea_id').optional().isInt({ min: 1 }).withMessage('El ID de la tarea debe ser un número positivo'),
    ],
    validarCampos,
    AdjuntoControlador.actualizarAdjunto
);

// Eliminar un adjunto
router.delete(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')],
    validarCampos,
    AdjuntoControlador.eliminarAdjunto
);

module.exports = router;
