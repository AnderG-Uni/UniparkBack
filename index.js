const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/routers.js');
require('dotenv').config();
const app = express();
const path = require("path");
const port = process.env.PORT;

// utilizacion de los modulos instalados 
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); // Servir archivos estáticos
app.use('/api-rest/v1', userRoutes);

//Ruta raiz
app.get('/', async (req, res) => {
  res.send("Bienvenido a la API del proytecto UniPark");
});

app.listen(port, () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
