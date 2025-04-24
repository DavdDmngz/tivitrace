const cron = require('node-cron');
const { Op } = require('sequelize');
const Usuarios = require('../../modelos/usuario.modelo');

cron.schedule('0 * * * *', async () => {
    console.log("Eliminando clave temporal...");
    await Usuarios.update(
        { token_recuperacion: null, expiracion_token: null },
        { where: { expiracion_token: { [Op.lt]: new Date() } } }
    );
});

module.exports = cron;