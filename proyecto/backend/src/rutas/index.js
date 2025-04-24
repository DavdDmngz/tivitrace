const { Router } = require("express");
const rutas = Router();
const { validarAutenticacion, validarRol } = require('../core/config/passport.config');
rutas.get('/', (req,res)=>{
    res.send('Home');
});
rutas.get('/protegida', validarAutenticacion, validarRol(['administrador', 'supervisor']), (req, res) => {
    res.json({ mensaje: 'Acceso permitido' });
  });
module.exports = rutas;