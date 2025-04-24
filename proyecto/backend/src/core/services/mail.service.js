const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarCorreoRecuperacion = async (correo, codigo) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correo,
        subject: "Recuperación de contrasena",
        text: `Tu clave temporal es es: ${codigo}. Expira en 15 minutos.`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { enviarCorreoRecuperacion };