const corsOptions = {
    origin: '*', // Puedes cambiar esto por una URL específica si quieres restringir
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = corsOptions;
