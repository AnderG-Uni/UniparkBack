const MongoDB = require('../database/connect_mongodb.js');
const Auth = require('./Controller_Web_Auth.js');
const { ObjectId } = require('mongodb');

//------------- metodo  para registrar parqueaderos ---------------------  VERIFICADO
const NewParking = async (req, res) => {

    const JWToken =req.cookies.SessionKey
    const DatosSesion = await Auth.ValidateJWT(JWToken);
    console.log('Sesion? ', DatosSesion);
    if (DatosSesion == "SesionOK"){  //Valido la sesion  con le token 

        try{
            const datos = req.body;
            try{ 
                //valido que los datos envidos no existan en la BD
                const ValidaUser = await MongoDB.db('Unipark').collection('parqueaderos').findOne({nombre: datos.nombre});
                if(!ValidaUser){
            
                    //Registro el parqueadero
                    const registroUser =  await MongoDB.db('Unipark').collection('parqueaderos').insertOne({nombre: datos.nombre, lugar: datos.lugar, capacidad: datos.capacidad});
                    if (registroUser.acknowledged) {
                        //Consulto el nombre del parqueaderos ya creado
                        const DatosUser = await MongoDB.db('Unipark').collection('parqueaderos').findOne({nombre: datos.nombre });
                        if (DatosUser) {
                            // Se da respuesta de exitosa del proceso.
                            res.status(200).json({status: "Parqueadero creado exitosamente", id_parqueadero: DatosUser._id, nombre: DatosUser.nombre})
                        }else{
                            res.status(500).send("Error consultando información del Parqueadero creado.");
                        }
                    
                    } else {
                    res.status(500).json({ status: "Se ha producido un error guardando el registro" });
                    }
            
                }else{
                    res.status(200).json({ status: "El Parqueadero ya existe en el sistema, por favor ingresa un nombre diferente."});
                }
        
            } catch (error) {
            res.status(500).json({ status: "Error", message: "Ha ocurrido un error con la BD." });
            }

        } catch (error){
            res.status(500).json({status: "Error", message: "No se pudo obtener los datos enviados"})
        }

    }else if (DatosSesion == "SesionFAIL") { res.status(200).json({status: "Token invalido", message: "Acceso no autorizado, no hay o faltan datos del usuario"});
    }else if (DatosSesion == "SesionEXP")  { res.status(200).json({status: "Token expirado", message: "El Token vencio, inicia sesión nuevamente."}); 
    }else if (DatosSesion == "SesionEMPTY"){ res.status(200).json({status: "Token ausente", message: "Tu sesión expiro, por favor vuelve a ingresar."}); 
    }
};


//---------------metodo para buscar la info de un parqueadero--------------------- 
const InfoParking = async (req, res) => {    
  const datos = req.body;
    try {
  
      // Buscar en la colección 'codigos' los documentos que tengan el estado  con el id del user  autenticado
      const DatosParking = await MongoDB.db('Unipark').collection('parqueaderos').find().toArray();
      if (!Object.keys(DatosParking).length == 0 ) {
        res.json( DatosParking );
      }else{
        //console.log('No hay parqueaderos registrados.');
        res.json({ status: "No hay  parqueaderos registrados." });
      }
  
    } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
    };
};


// Funcion que consulta el historial de ingresos de los vehiculos por usuario
const HistorialAuth = async (req, res) => {    
    try {
      const datos = req.body;
  
        console.log("id_persona:::::: ", datos.id_persona);
      // Buscar en la colección 'codigos' los documentos que tengan el estado  con el id del user  autenticado
        const DatosParking = await MongoDB.db('Unipark').collection('autenticacion').aggregate([
            {
                $match: {
                    id_persona: new ObjectId(datos.id_persona)  // <-- Filtro base
                }
            },
            {
                $lookup: {
                    from: 'vehiculos',           // colección relacionada
                    localField: 'id_vehiculo',   // campo en autenticacion
                    foreignField: '_id',         // campo en vehiculos
                    as: 'datos_vehiculo'         // nombre del array resultante
                }
            },
            {
                $unwind: '$datos_vehiculo'      // convierte array en objeto plano
            }
          ]).toArray();

        console.log("datos: ",  DatosParking);


      if (!Object.keys(DatosParking).length == 0 ) {
        res.json( DatosParking );
      }else{
        //console.log('No hay parqueaderos registrados.');
        res.json({ status: "No hay  parqueaderos registrados." });
      }
  
    } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
    };
};


//---------------metodo actualizar el parqueadero --------------------- INICIANDO, 
const UpdateParking = async (req, res) => {
    const datos = req.body;
    try {
  
      //Se busca por id del parqueadero 
      const DatosParking = await MongoDB.db('Unipark').collection('parqueaderos').find({_id: new ObjectId(datos.id_parqueadero)}).toArray();
      if (!Object.keys(DatosParking).length == 0 ) { // se valida que exista y traiga los datos
        
       // console.log("Datos enviados para actualizar", datos );
        //actualizo el registro
        const ActualizarRegistro =  MongoDB.db('Unipark').collection('parqueaderos').updateOne({ _id: new ObjectId(datos.id_parqueadero)}, { $set: {nombre: datos.nombre, lugar: datos.lugar, capacidad: datos.capacidad} } );
        if (ActualizarRegistro) {
            res.json({mensaje: "Se realizo la actualizaón del parqueadero exitosamente."});
          } else {
            res.json({mensaje: "No se realizo la actualizaón del parqueadero."});
          }
      }else{
        console.log('No hay datos registrados para el parqueaderos.');
        res.json({ status: "No hay datos registrados para el parqueaderos." });
      }
  
    } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
  };


  module.exports = {
    NewParking,
    UpdateParking,
    InfoParking,
    HistorialAuth
  };