const MongoDB = require('../database/connect_mongodb.js');
const path = require('path');
const fs = require("node:fs");
const multer = require("multer");
const moment = require('moment-timezone');
const Auth = require('./Controller_Web_Auth.js');
const { ObjectId } = require('mongodb');


//------------- metodo  para registrar vehiculos --------------------- TERMINDO, validado
const NewVehicle = async (req, res) => {

    //const JWToken =req.cookies.SessionKey
    //const DatosSesion = await Auth.ValidateJWT(JWToken);
    //console.log('Sesion? ', DatosSesion);
    //if (DatosSesion == "SesionOK"){  //Valido la sesion  con le token 

        try{
            const datos = req.body;
            try{ 
                //valido que los datos envidos no existan en la BD
                const ValidaCar = await MongoDB.db('Unipark').collection('vehiculos').findOne({placa: datos.Placa});
                if(!ValidaCar){
            
                    //Registro el vehiculo
                    const fechaR = moment().tz('America/Bogota').format('DD/MM/YYYY');
                    const IdUser = new ObjectId(datos.id_usuario)
                    //console.log("datos que llegan: ",datos);
                    const registroVehicule =  await MongoDB.db('Unipark').collection('vehiculos').insertOne({placa: datos.placa, tipo: datos.tipo, color: datos.color, marca: datos.marca, modelo: datos.modelo, id_usuario: IdUser, urlQr: datos.urlQr, urlVehiculo: datos.urlVehiculo, fecha_registro: fechaR});
                    if (registroVehicule.acknowledged) {                                                    
                        //Consulto el id del vehiculo ya creado
                        //console.log("Llegue aqui 11");
                        const DatosVehiculo = await MongoDB.db('Unipark').collection('vehiculos').findOne({placa: datos.placa });
                        //console.log("Llegue aqui 22: ", DatosVehiculo);
                        if (DatosVehiculo) {
                            // Se da respuesta de exitosa del proceso.
                            //console.log("datos qe se van: ", DatosVehiculo);
                            res.status(200).json({status: "Vehiculo creado exitosamente", DatosVehiculo})
                        }else{
                            res.status(500).send("Error consultando información del vehiculo creado.");
                        }
                    
                    } else {
                    res.status(500).json({ status: "Se ha producido un error guardando el registro" });
                    }
            
                }else{
                    res.status(200).json({ status: "El vehiculo ya existe en el sistema, por favor ingresa una placa diferente."});
                }
        
            } catch (error) {
            res.status(500).json({ status: "Error", message: "Ha ocurrido un error con la BD." });
            }

        } catch (error){
            res.status(500).json({status: "Error", message: "No se ha podido obtener los datos."})
        }

    //}else if (DatosSesion == "SesionFAIL") { res.status(401).json({status: "Token invalido", message: "Acceso no autorizado, no hay o faltan datos del usuario"});
    //}else if (DatosSesion == "SesionEXP")  { res.status(401).json({status: "Token expirado", message: "El Token vencio, inicia sesión nuevamente."}); 
    //}else if (DatosSesion == "SesionEMPTY"){ res.status(401).json({status: "Token ausente", message: "Tu sesión expiro, por favor vuelve a ingresar."}); 
    //}
};

//------------- metodo  para actualizar vehiculos --------------------- TERMINDO, validado
const UpdateVehicle = async (req, res) => {
    try {
       // const { placa } = req.params; // La placa vendrá en la URL
        const {placa, urlVehiculo, urlQr, color } = req.body;

        if(!urlVehiculo || !color ){  // si estas dos variables no existen es una creación de vehiculo.
            //console.log("Datos eviados___ : url: ", urlVehiculo, " - urlQR: ", urlQr,  " - color: ", color, " - placa: ", placa, );
            const resultado = await MongoDB.db('Unipark').collection('vehiculos').updateOne({ placa: placa}, { $set: {urlQr: urlQr} } )
            res.status(200).json({status: "Se guardo exitosamente los datos.", resultado});

        }else {  //si existen pasaran acá y es una actualización de datos del vehiculo.
            //console.log("Datos eviados___ : url: ", urlVehiculo, " - urlQR: ", urlQr,  " - color: ", color, " - placa: ", placa, );

            if (!placa) {
                return res.status(400).json({ status: "Error", message: "Se requiere la placa del vehículo a actualizar." });
            }

            const filtro = { placa: placa };
            const nuevosDatos = {
                $set: {
                    color,
                    urlVehiculo,
                    urlQr
                }
            };

            const resultado = await MongoDB.db('Unipark').collection('vehiculos').updateOne(filtro, nuevosDatos);

            if (resultado.matchedCount === 0) {
                return res.status(404).json({ status: "Error", message: "Vehículo no encontrado." });
            }

            res.status(200).json({ status: "Vehículo actualizado exitosamente." });

        }
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        res.status(500).json({ status: "Error", message: "Error interno del servidor." });
    }
};

//------------- metodo  para actualizar vehiculos --------------------- TERMINDO, validado
const DeleteVehicle = async (req, res) => {
    try {
       // const { placa } = req.params; // La placa vendrá en la URL
        const {id_vehiculo} = req.body;

            if (!id_vehiculo) {
                return res.status(400).json({ status: "Error", message: "Se requiere el ID del vehículo a Eliminar." });
            }

            console.log("Vehiculo a eliminar... ", id_vehiculo );
            const resultado = await MongoDB.db('Unipark').collection('vehiculos').deleteOne({ _id: new ObjectId(id_vehiculo) });
            if (resultado.matchedCount === 0) {
                return res.status(404).json({ status: "Error", message: "Id del Vehículo no fue encontrado." });
            }

            res.status(200).json({ status: "Vehículo eliminado exitosamente." });
        
    } catch (error) {
        console.error('Error al eliminar el vehículo:', error);
        res.status(500).json({ status: "Error", message: "Error interno del servidor." });
    }
};

//------------- metodo  para subir foto vehiculos --------------------- TERMINDO, validado
const SubirImagenVehiculo = async (req, res) => {
    try {
            if (!req.file) {
                return res.status(400).json({message: "No se recibió ninguna imagen del vehículo."});
            }
            //renombro el archivo y lo guardo
            const NuevaRuta = path.join(__dirname, `./../public/img-vehiculos/${req.file.originalname}`) ;
            fs.renameSync(req.file.path, NuevaRuta);
            // creo la url donde se almaceno la nueva imagen publicamente
            const qrUrl = `${req.protocol}://${req.get("host")}/img-vehiculos/${req.file.originalname}`;
            console.log("url del archivo: ", qrUrl);
            // devuelvo el estado OK
            res.status(200).json({ message: "Imagen Guardada exitosamente.", qrUrl });
    
        }catch (error) {
            console.error("Error guardando el QR:", error);
            res.status(500).json({ message: "Error guardando la imagen QR.", error });
        }
};

//------------- metodo  para listar todos los vehiculos por usuario --------------------- TERMINDO, validado
const InfoVehicle = async (req, res) => {
        try {
            const datos = req.body;
            const vehiculos = await MongoDB.db('Unipark').collection('vehiculos').find({id_usuario: new ObjectId(datos.IDUSER)}).toArray();
    
            if (Object.keys(vehiculos).length == 0) {
                return res.status(404).json({ status: "Sin datos", message: "No hay vehículos registrados." });
            }
    
            res.status(200).json({ status: "OK", vehiculos });
    
        } catch (error) {
            console.error('Error al listar vehículos:', error);
            res.status(500).json({ status: "Error", message: "Error interno del servidor." });
        }
};

//------------- metodo  para listar todos los vehiculos por usuario --------------------- TERMINDO, validado
const InfoVehicleId = async (req, res) => {
        try {
            const datos = req.body;
            const vehiculos = await MongoDB.db('Unipark').collection('vehiculos').find({_id: new ObjectId(datos.id_vehiculo)}).toArray();
    
            if (Object.keys(vehiculos).length == 0) {
                return res.status(404).json({ status: "Sin datos", message: "No se encuentra el registro." });
            }
    
            res.status(200).json({ status: "OK", vehiculos });
    
        } catch (error) {
            console.error('Error al listar vehículos:', error);
            res.status(500).json({ status: "Error", message: "Error interno del servidor." });
        }
};

//------------- metodo  para registrar el ingreso de vehiculos  al campus --------------------- TERMINDO, validado
const IncomeVehicle = async (req, res) => {

    const JWToken =req.cookies.SessionKey
    const DatosSesion = await Auth.ValidateJWT(JWToken);
    //console.log('Sesion? ', DatosSesion);
    if (DatosSesion == "SesionOK"){  //Valido la sesion  con le token 
        try{
            const datos = req.body;
            //valido que el nuevo registro de ingreso no tenga un registro activo sin cerrar
            const ValidaCar = await MongoDB.db('Unipark').collection('autenticacion').findOne({id_persona: new ObjectId(datos.id_persona)});
            // si no existe el registro se debe crar el registro  debido a que no existe en la BD
            if(!ValidaCar ){

                //se crea el registro
                try{
                    const registroIngresoVehiculo =  await MongoDB.db('Unipark').collection('autenticacion').insertOne({id_persona: new ObjectId(datos.id_persona), id_vehiculo: new ObjectId(datos.id_vehiculo), sede: datos.sede, fecha_entrada: datos.fecha_entrada, hora_entrada: datos.hora_entrada, fecha_salida: datos.fecha_salida, hora_salida: datos.hora_salida, observacion: datos.observacion, id_usuario_admin: new ObjectId(datos.id_guarda)});
                    console.log('Datos de ingreso registrados ', registroIngresoVehiculo);
                    if (registroIngresoVehiculo.acknowledged) {
                        //Consulto el id del vehiculo ya creado
                        const DatosIngresoCar = await MongoDB.db('Unipark').collection('autenticacion').findOne({id_persona: new ObjectId(datos.id_persona) });
                        if (DatosIngresoCar) {
                            // Se da respuesta de exitosa del proceso.
                            res.status(200).json({status: "Registro de ingreso creado.", DatosIngresoCar})
                        }else{
                            res.status(500).json({ status: "Se ha producido un error guardando la información de ingreso del usuario al campus." });
                        }
                    }else {
                        res.status(500).json({ status: "Se ha producido un error guardando el registro de ingreso." });
                    }
                }catch (error) {
                    res.status(500).json({ status: "Error", message: "Ha ocurrido un error con la base de datos mientras se creaba el registro de ingreso." });
                }
        
            }else{ //si ya exite un registro del usuario se valida las varibales de salida para ver si estan vacias y no dejar registrarlo nuevamente

                // se niega el valor de las variables y se entiende que tienen valores las variables de salida
                if(!ValidaCar.fecha_salida == "" && !ValidaCar.hora_salida == ""){

                    //se crea el registro
                    try{
                        const registroIngresoVehiculo =  await MongoDB.db('Unipark').collection('autenticacion').insertOne({id_persona: new ObjectId(datos.id_persona), id_vehiculo: new ObjectId(datos.id_vehiculo), sede: datos.sede, fecha_entrada: datos.fecha_entrada, hora_entrada: datos.hora_entrada, fecha_salida: datos.fecha_salida, hora_salida: datos.hora_salida, observacion: datos.observacion, id_usuario_admin: new ObjectId(datos.id_guarda)});
                        console.log('Datos de ingreso registrados ', registroIngresoVehiculo);
                        if (registroIngresoVehiculo.acknowledged) {
                            //Consulto el id del vehiculo ya creado
                            const DatosIngresoCar = await MongoDB.db('Unipark').collection('autenticacion').findOne({id_persona: new ObjectId(datos.id_persona) });
                            if (DatosIngresoCar) {
                                // Se da respuesta de exitosa del proceso.
                                res.status(200).json({status: "Registro de ingreso creado.", DatosIngresoCar})
                            }else{
                                res.status(500).json({ status: "Se ha producido un error guardando la información de ingreso del usuario al campus." });
                            }
                        }else {
                            res.status(500).json({ status: "Se ha producido un error guardando el registro de ingreso." });
                        }
                    }catch (error) {
                        res.status(500).json({ status: "Error", message: "Ha ocurrido un error con la base de datos mientras se creaba el registro de ingreso." });
                    }
                }else{ // si las variables de salida estan vacias  no se deja crear el nuevo  registro
                    res.status(200).json({Error: "No se puede ingresar el vehículo por que aun tiene un resgistro activo sin cerrar."});
                }
            }
        } catch (error){
            res.status(500).json({status: "Error", message: "No se puede obtener información de la Base de datos."})
        }

    }else if (DatosSesion == "SesionFAIL") { res.status(200).json({status: "Token invalido", message: "Acceso no autorizado, no hay o faltan datos del usuario"});
    }else if (DatosSesion == "SesionEXP")  { res.status(200).json({status: "Token expirado", message: "El Token vencio, inicia sesión nuevamente."}); 
    }else if (DatosSesion == "SesionEMPTY"){ res.status(200).json({status: "Token ausente", message: "Tu sesión expiro, por favor vuelve a ingresar."}); 
    }
};

//----------------------- metodo  para actualizar el registro de ingreso de un vehiculo en el campus ----------------------//
const ExitVehicle = async (req, res) => {
    const datos = req.body;
    try {
        // Buscar si existe un registro con variables de salida libres
        const SalidaVehiculo = await MongoDB.db('Unipark').collection('autenticacion').find({ id_persona: new ObjectId(datos.id_persona)}).sort({ _id: -1 }).limit(1).toArray();
        if (SalidaVehiculo[0].fecha_salida == "" && SalidaVehiculo[0].hora_salida == "" ) {
            // Actualizar los datos
            const actualizacionSalida = await MongoDB.db('Unipark').collection('autenticacion').updateOne(
                { _id: new ObjectId(SalidaVehiculo[0]._id) },
                {   $set: {
                        fecha_salida: datos.fecha_salida,
                        hora_salida: datos.hora_salida
                    }
                }
            );

            if (actualizacionSalida.modifiedCount > 0) {
                res.json({ status: "Registro de salida del vehículo exitoso." });
            } else {
                res.json({ status: "No se realizaron cambios." });
            }

        } else {
            res.json({ status: "No hay un registro de ingreso para este vehículo." });
        }

    } catch (error) {
        console.error('Error con la Base de datos:', error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
};
    

module.exports = {
    NewVehicle,
    UpdateVehicle,
    DeleteVehicle,
    InfoVehicle,
    IncomeVehicle,
    ExitVehicle,
    InfoVehicleId,
    SubirImagenVehiculo
  };