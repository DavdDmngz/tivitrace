const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/img/usuarios'));
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
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
}).single('img');

module.exports = upload;