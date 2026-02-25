const MongoDB = require('../database/connect_mongodb.js');
const Jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const CryptoJS = require("crypto-js");
const Time = require('moment-timezone');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const axios = require('axios');
const mime = require('mime-types');


//--------------- Abrir la sesion de usuario ---------------------
 const Login = async (req, res) => {

  // Decalro las variables a usar
    const datos = req.body;
    //console.log("LOGIN: ", datos);
    const hashedPassword = CryptoJS.SHA256(datos.clave, process.env.CODE_SECRET_DATA).toString();
    //console.log("PASSS: ", hashedPassword);
    try{
      //const users =  await MongoDB.db('Unipark').collection('usuarios').find().toArray()
      //console.log("USERS: ", users);
      const login =  await MongoDB.db('Unipark').collection('usuarios').findOne({ correo: datos.correo, clave: hashedPassword });
      //console.log(" Datos del USER: ", login);
      if (login) {

        // Obtener la fecha y hora actual en formato Bogotá
        const FechaActual = Time().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
        // Actualizo la hora de cuando se inicio la sesion 
        await MongoDB.db('Unipark').collection('usuarios').updateOne({correo: datos.correo}, { $set: {fecha_login: FechaActual } });
        // Creo el token de validacion de sesion
        //const Token = Jwt.sign({id: login._id, correo: login.correo, rol: login.rol }, process.env.CODE_JWT_KEY, {expiresIn: '1h'});

        // Devuelvo la información con la cookie y la respuesta de bienvenida
        console.log("NUEVO INICIO SESION: ", login.correo);
        //res.cookie('SessionKey', Token, {httpOnly: true, secure: process.env.SECURE_COOKIE, sameSite: 'lax', maxAge: 1000 * 60 * 90})
        res.status(200).json({ status: "Bienvenido", correo: login.correo, nombres: login.nombres, _id: login._id, rol: login.rol});

      } else {
        res.status(401).json({ status: "Error en las credenciales, por favor intente nuevamente!" });
      }

    } catch (error) {
      res.status(500).json({ status: "Error", message: "Se ha producido un error en el servidor" });
    }
 };
  
//--------------- Cerrar sesion de usuario ---------------------
 const Logout = async (req, res) => {
    res.clearCookie("SessionKey").json({messaje: "Has cerrado la sesión correctamente."});
 }
  
//------- metodo buscar información de ultimos inicio de sesion ---------
 const InfoRegistroLogin = async (req, res) => {
    const datos = req.body;
    try {
  
      // se realiza la consulta de  los del user sobre la BD
      const DatosLogUsers = await MongoDB.db('Parcial2').collection('log_login').find({user: datos.user}).sort({_id:-1}).limit(1).toArray();
      if (!Object.keys(DatosLogUsers).length == 0 ) {
        res.json( DatosLogUsers );
  
      }else{
        console.log('No hay datos registrados para el usuario.');
        res.json({ status: "No hay datos registrados para el usuario." });
      }
  
    } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
 };

 //----------------------- funcion que valida la cookie con el jwt valido --------------------
 async function ValidateJWT (token) {
    
  if(!token){ //valido si en la variable token viene algo
      return "SesionEMPTY"
  }else{ 
      try{
          const data = Jwt.verify(token, process.env.CODE_JWT_KEY);
          if(data.correo.length) { return "SesionOK" }
          else { return "SesionFAIL" }
          
      } catch (error) {
          return "SesionEXP"; // el motivo seria por que no hay tocken en la solicitud del cliente
      }
   }
 };
  
  module.exports = {
    Login,
    Logout,
    ValidateJWT,
    InfoRegistroLogin
    
  };