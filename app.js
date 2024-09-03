const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const usersRoutes = require('./routes/user-routes'); 
const assetRoutes = require('./routes/asset-routes'); 
const HttpError = require('./models/http-error'); 

require('dotenv').config();

const app = express();

// Configuración de CORS personalizada
app.use(cors({
  origin: 'http://localhost:3000', // Dominio permitido
  methods: ['GET','HEAD','PUT','POST', 'PATCH', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
  credentials: true // Credenciales o cookies permitidas
}));

// Middleware para analizar el cuerpo de las solicitudes JSON
app.use(bodyParser.json());

app.use('/api/users', usersRoutes); // Registrar endpoints bajo /api/users

// Registrar las rutas de assets bajo /api/assets
app.use('/api/assets', assetRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  const error = new HttpError('No se pudo encontrar esta ruta.', 404);
  throw error;
});

// Middleware para manejo de errores
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || '¡Ocurrio un error desconocido!' });
});

// Conexión a la base de datos y puesta en marcha del servidor
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
    app.listen(5000, () => console.log('Servidor corriendo en puerto 5000'));
  })
  .catch(err => {
    console.log(err);
  });
