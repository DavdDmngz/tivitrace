const multer = require('multer');
const path = require('path');
const fs = require('fs');  // Importa el módulo fs para trabajar con el sistema de archivos

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../../public/img/usuarios');
        
        // Verifica si la carpeta de destino existe, si no, la crea
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });  // Crea la carpeta de forma recursiva
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const userId = req.params.id || 'default-user';
        const extension = path.extname(file.originalname).toLowerCase();
        const fileName = `user-${Date.now()}-${userId}${extension}`;
        console.log('Archivo guardado como:', fileName);
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Formato no válido. Solo se permiten imágenes'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },  // Límite de 15MB
    fileFilter
});

module.exports = upload;
