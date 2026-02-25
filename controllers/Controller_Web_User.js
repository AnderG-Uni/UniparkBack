const MongoDB = require('../database/connect_mongodb.js');
const Auth = require('./Controller_Web_Auth.js');
const axios = require('axios');
const multer = require('multer');
const Jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');



//------------- metodo  para registrar usuarios --------------------- TERMINDO, validado
const NewUser = async (req, res) => {

    //const JWToken =req.cookies.SessionKey
    //const DatosSesion = await Auth.ValidateJWT(JWToken);
    //console.log('Sesion? ', DatosSesion);
    //if (DatosSesion == "SesionOK"){  //Valido la sesion  con le token 

        try{
            const datos = req.body;

            console.log('NEW PETICION:::::::::: ', datos);
            const PasswordEncrypt = CryptoJS.SHA256(datos.clave, process.env.CODE_SECRET_DATA).toString();
            
            try{ 
                //valido que los datos envidos no existan en la BD
                const ValidaUser = await MongoDB.db('Unipark').collection('usuarios').findOne({correo: datos.correo});
                if(!ValidaUser){
            
                    //Registro el user
                    const registroUser =  await MongoDB.db('Unipark').collection('usuarios').insertOne({nombres: datos.nombres, correo: datos.correo, clave: PasswordEncrypt, fecha_login: "null", id_rol: datos.rol });
                    if (registroUser.acknowledged) {
                        //Consulto el id del usuario ya creado
                        const DatosUser = await MongoDB.db('Unipark').collection('usuarios').findOne({correo: datos.correo });
                        if (DatosUser) {
                            // Se da respuesta de exitosa del proceso.
                            console.log('NEW USER: ', DatosUser.correo);
                            res.status(200).json({status: "Usuario creado exitosamente", correo: DatosUser.correo})
                        }else{
                            res.status(500).send("Error consultando información del usuario creado.");
                        }
                    
                    } else {
                        res.status(500).json({ status: "Se ha producido un error guardando el registro" });
                    }
            
                }else{
                    res.status(200).json({ status: "El usuario ya existe en el sistema, por favor ingresa un correo diferente."});
                }
        
            } catch (error) {
            res.status(500).json({ status: "Error", message: "Ha ocurrido un error con la BD." });
            }

        } catch (error){
            res.status(500).json({status: "Error", message: "No se ha podido encriptar la clave."})
        }

    //}else if (DatosSesion == "SesionFAIL") { res.status(200).json({status: "Token invalido", message: "Acceso no autorizado, no hay o faltan datos del usuario"});
    //}else if (DatosSesion == "SesionEXP")  { res.status(200).json({status: "Token expirado", message: "El Token vencio, inicia sesión nuevamente."}); 
    //}else if (DatosSesion == "SesionEMPTY"){ res.status(200).json({status: "Token ausente", message: "Tu sesión expiro, por favor vuelve a ingresar."}); 
    //}
};

//---------------metodo para buscar la info del usuario--------------------- TERMINADO, verificado
const InfoUser = async (req, res) => {
    const datos = req.body;
    try {
  
      // Buscar en la colección 'codigos' los documentos que tengan el estado  con el id del user  autenticado
      const DatosUser = await pool.db('Parcial2').collection('users').find({user: datos.user}).toArray();
      if (!Object.keys(DatosUser).length == 0 ) {
        res.json( DatosUser );
      }else{
        console.log('No hay datos registrados para el usuario.');
        res.json({ status: "No hay datos registrados para el usuario." });
      }
  
    } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
};


//------------- metodo  para guardar los datos de la persona --------------------- //
const CreatePeople = async (req, res) => {
    const datos = req.body;
    try {
        // Validar si ya existe una persona con el mismo número de documento
        const validaPersona = await MongoDB.db('Unipark').collection('personas').findOne({ numero_documento: datos.numero_documento });
        
        if (!validaPersona) {
            // Registrar la persona
            const registroPersona = await MongoDB.db('Unipark').collection('personas').insertOne({
                nombres: datos.nombres,
                tipo_documento: datos.tipo_documento,
                numero_documento: datos.numero_documento,
                telefono: datos.telefono,
                estado: datos.estado,
                carrera: datos.carrera,
                id_universitario: datos.id_universitario,
                id_vehiculo1: datos.id_vehiculo1,
                id_vehiculo2: datos.id_vehiculo2,
                //id_usuario: new ObjectId(datos.id_usuario)
            });

            if (registroPersona.acknowledged) {
                // Confirmar el registro consultando el documento insertado
                const personaRegistrada = await MongoDB.db('Unipark').collection('personas').findOne({ numero_documento: datos.numero_documento });
                if (personaRegistrada) {
                    res.status(200).json({ status: "Persona registrada exitosamente", nombres: personaRegistrada.nombres });
                } else {
                    res.status(500).send("Error consultando la información de la persona registrada.");
                }
            } else {
                res.status(500).json({ status: "Se ha producido un error guardando el registro." });
            }

        } else {
            res.status(200).json({ status: "La persona ya existe en el sistema, por favor verifica el número de documento." });
        }

    } catch (error) {
        console.error("Error con la BD:", error);
        res.status(500).json({ status: "Error", message: "Ha ocurrido un error con la base de datos." });
    }
};

//----------------------- metodo para actualiza persona ----------------------//
const UpdatePersona = async (req, res) => {
    const datos = req.body;

    try {
        // Buscar si existe la persona por número de documento
        console.log("Datos::   ", datos);

        const personaExistente = await MongoDB.db('Unipark').collection('personas').findOne({ _id: new ObjectId(datos.idUsuario) });

        if (personaExistente) {
            // Actualizar los datos
            const actualizacion = await MongoDB.db('Unipark').collection('personas').updateOne(
                { _id: new ObjectId(datos.idUsuario) },
                {
                    $set: {
                        nombres: datos.Nombres,
                        numero_documento: datos.NumDoc,
                        telefono: datos.Telefono,
                        carrera: datos.Carrera
                    }
                }
            );

            if (actualizacion.modifiedCount > 0) {
                res.status(200).json({ status: "Persona actualizada exitosamente." });
            } else {
                res.status(201).json({ status: "No se realizaron cambios. Los datos pueden ser los mismos." });
            }

        } else {
            res.status(404).json({ status: "No se encontró una persona con ese número de documento." });
        }

    } catch (error) {
        console.error('Error al actualizar la persona:', error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
};

//--------------- Método para listar todas las personas ----------------------//
const ListarPersonas = async (req, res) => {
    try {
        const datos = req.body;
        if (!datos.IDUSER) {
            return res.status(400).json({ status: "Error", message: "IDUSER no proporcionado." });
        }
        
        const userObjectId = new ObjectId(datos.IDUSER);
        //console.log('id user enviado:', datos.IDUSER);
        const personas = await MongoDB.db('Unipark').collection('personas').findOne({id_usuario: userObjectId});

        // Verificar si hay personas registradas
        if (personas) {
            res.status(200).json(personas);
        } else {
            res.status(404).json({ status: "No hay personas registradas." });
        }

    } catch (error) {
        console.error('Error al consultar las personas:', error);
        res.status(500).json({ status: "Error", message: "Error interno del servidor." });
    }
};

//---------------metodo actualizar el idioma --------------------- TERMINADO 
const UpdateLanguageUser = async (req, res) => {
    const JWToken = req.cookies.SessionKey
    const DatosSesion = await Auth.ValidateJWT(JWToken);
    console.log('Sesion? ', DatosSesion);
    if (DatosSesion == "SesionOK") {   //Valido la sesion   con el token
        const datos = req.body;
        try {
            const { id_usuario, idioma } = datos;

            if (!id_usuario || !idioma || (idioma !== 'español' && idioma !== 'ingles')) {
                return res.status(400).json({ status: "Error", message: "Se requiere el id del usuario y el idioma en ('español' o 'ingles')." });
            }

            const updateResult = await MongoDB.db('Unipark').collection('idioma').updateOne(
                { id_usuario: new ObjectId(id_usuario) },
                { $set: { idioma: idioma } }  // Actualiza el campo 'idioma'
            );

            if (updateResult.modifiedCount > 0) {
                res.status(200).json({ status: "Idioma actualizado exitosamente", idioma: idioma });
            } else if (updateResult.matchedCount > 0) {
                res.status(200).json({ status: "El idioma del usuario ya está configurado en", idioma: idioma });
            } else {
                res.status(404).json({ status: "Error", message: "No se encontró el usuario con el ID proporcionado." });
            }

        } catch (error) {
            console.error('Error al actualizar el idioma del usuario:', error);
            res.status(500).json({ status: "Error", message: "Ha ocurrido un error al actualizar el idioma en la BD." });
        }
    } else if (DatosSesion == "SesionFAIL") {
         res.status(200).json({ status: "Token invalido", message: "Acceso no autorizado, no hay o faltan datos del usuario" });
    } else if (DatosSesion == "SesionEXP") {
        res.status(200).json({ status: "Token expirado", message: "El Token vencio, inicia sesión nuevamente." });
    } else if (DatosSesion == "SesionEMPTY") {
        res.status(200).json({ status: "Token ausente", message: "Tu sesión expiro, por favor vuelve a ingresar." });
    }
};

//---------------metodo listar el idioma por usuario--------------------- TERMINADO
const InfoIdioma = async (req, res) => {
    const datos = req.body;
    try {
  
      // Buscar en la colección 'codigos' los documentos que tengan el estado  con el id del user  autenticado
      const DatosIdioma = await MongoDB.db('Unipark').collection('idioma').find({id_usuario: new ObjectId(datos.id_usuario)}).toArray();
      if (!Object.keys(DatosIdioma).length == 0 ) {
        res.json(DatosIdioma);
      }else{
        console.log('No hay datos registrados para el usuario.');
        res.json({ status: "No hay datos registrados para el usuario." });
      }
  
    } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
};

 
module.exports = {
    NewUser,
    InfoUser,
    CreatePeople,
    UpdatePersona,
    ListarPersonas,
    UpdateLanguageUser,
    InfoIdioma
  };