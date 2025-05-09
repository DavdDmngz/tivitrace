require('dotenv').config();
require('./core/config/cron.config');

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const corsOptions = require('./core/config/cors.config'); // Ruta donde está tu objeto de configuración CORS

const db = require('./core/config/database.config');
const { configurarModelos } = require('./configurarmodelos');

// Rutas
const rutas = require('./rutas/index');
const usuarioRutas = require('./rutas/usuario.rutas');
const rolRutas = require('./rutas/rol.rutas');
const rol_usuarioRutas = require('./rutas/rol_usuario.rutas');
const permisoRutas = require('./rutas/permiso.rutas');
const rol_permisoRutas = require('./rutas/rol_permiso.rutas');
const proyectoRutas = require('./rutas/proyecto.rutas');
const tareaRutas = require('./rutas/tarea.rutas');
const authRutas = require('./rutas/auth.rutas');
const participanteRutas = require('./rutas/participante.rutas'); // 👈 NUEVO
const reportesRutas = require('./rutas/reporte.rutas'); // 👈 NUEVO

const app = express();

app.use((req, res, next) => {
    console.log("🌐 Origin:", req.headers.origin);
    next();
  });
  

// Servir archivos estáticos de la carpeta 'public/img/usuarios'
app.use('/img/usuarios', express.static(path.join(__dirname, '../public/img/usuarios')));
app.set('port', process.env.PORT || 3003);

// Middleware
app.use(cors(corsOptions)); // <<<< Aquí se activa CORS
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Rutas
app.use('/api', rutas);
app.use('/api/usuarios', usuarioRutas);
app.use('/api/roles', rolRutas);
app.use('/api/roles-usuario', rol_usuarioRutas);
app.use('/api/permisos', permisoRutas);
app.use('/api/rol-permisos', rol_permisoRutas);
app.use('/api/proyectos', proyectoRutas);
app.use('/api/tareas', tareaRutas);
app.use('/api/auth', authRutas);
app.use('/api/participantes', participanteRutas); // 👈 NUEVO
app.use('/api/reportes', reportesRutas); // 👈 NUEVO

// Conexión a base de datos
db.authenticate()
    .then(async () => {
        console.log("✅ Conexión a la base de datos establecida");
        await configurarModelos();
    })
    .catch((error) => {
        console.error("❌ Error al conectar con la base de datos:", error);
    });

// Middleware de error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensaje: 'Ocurrió un error inesperado en el servidor' });
});

// Iniciar servidor
app.listen(app.get('port'), () => {
    console.log(`🚀 Servidor iniciado en el puerto ${app.get('port')}`);
});
