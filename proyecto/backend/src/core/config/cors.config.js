const corsOptions = {
    origin: (origin, callback) => {
      if (origin === 'http://localhost:4200' || !origin) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'), false); // Bloquear otros orígenes
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Esto permite el envío de cookies y cabeceras de autorización
  };
  
  module.exports = corsOptions;
  