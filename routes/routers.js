const express = require('express');
const router = express.Router();

const WebAuthController = require('../controllers/Controller_Web_Auth.js');
const WebParkingController = require('../controllers/Controller_Web_Parking.js');
const WebUserController = require('../controllers/Controller_Web_User.js');
const WebQrController = require('../controllers/Controller_Web_CodQr.js');  
const WebCarController = require('../controllers/Controller_Web_Car.js');
const WebReportController = require('../controllers/Controller_Web_Report.js');
const AppSyncController = require('../controllers/Controller_App_Sync.js');

//::::::::::::::::::::::::::: CONTROLLER  WEB ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/login', WebAuthController.Login);                                     // Valido los intentos de login
router.post('/logout', WebAuthController.Logout);                                   // Valido los intentos de login

router.post('/nuevo/usuario', WebUserController.NewUser);                           // se crea los usuarios
router.post('/nuevo/persona', WebUserController.CreatePeople);                      //crear persona
router.post('/actualizar/usuario', WebUserController.UpdatePersona); 
router.post('/listar/persona', WebUserController.ListarPersonas);                   // actualizar perdona
//router.post('/actualizar/usuario', WebUserController.UpdateUser);                 // se actualiza los usuarios
router.post('/listar/usuario', WebUserController.InfoUser);                         // se muestra informacion de usuarios
//router.post('/inactivar/usuario', WebUserController.DeleteUser);                  // se eliminan los usuarios
router.post('/ajustes/idioma', WebUserController.UpdateLanguageUser);               // se actualiza el estado del idioma
router.post('/listar/idioma', WebUserController.InfoIdioma);                        // Se obtiene el idioma por cada usuario

router.post('/nuevo/vehiculo', WebCarController.NewVehicle);                         // se crea los vehiculos
router.post('/actualizar/vehiculo', WebCarController.UpdateVehicle);                 // se actualiza los vehiculos
router.post('/eliminar/vehiculo', WebCarController.DeleteVehicle);                   // se eliminan los vehiculos
router.post('/listar/vehiculo', WebCarController.InfoVehicle);                       // se muestra informacion de vehiculos por usuario
router.post('/listar/vehiculoid', WebCarController.InfoVehicleId);                   // se muestra informacion de vehiculos por id
router.post('/subir/imagenvehiculo', WebQrController.upload.single("ImagenVehiculo"), WebCarController.SubirImagenVehiculo); // se suben los QR al servidor
//router.post('/inactivar/vehiculo', WebCarController.DeleteVehicle);                // se eliminan los vehiculos
router.post('/registro/ingreso/vehiculo', WebCarController.IncomeVehicle);           // se registra el ingreso de un vehiculo
router.post('/registro/salida/vehiculo', WebCarController.ExitVehicle);              // se registra la salida de un vehiculo

router.post('/subir/qr', WebQrController.upload.single("qrimagen"), WebQrController.SaveQR); // se suben los QR al servidor
//router.get('/listar/qr', WebQrController.ListQR);                                 // se muestran el código QR para el usuario

//router.post('/reporte/motos_total', WebReportController.Report1);               // se muestra el reporte de motos total
//router.post('/reporte/carros_total', WebReportController.Report2);              // se muestra el reporte de carros total
//router.post('/reporte/bicibletas_total', WebReportController.Report3);          // se muestra el reporte de bicicletas total
//router.post('/reporte/ingresos', WebReportController.HistoryIncomeVehicle);     // se muestra el historial de registros por usuario

//router.post('/Administrar/usuarios', WebAdminController.ListUsers);             // se muestra los usuarios existente de la plataforma
//router.post('/Administrar/vehiculos', WebAdminController.ListVehicles);         // se muestra los usuarios existente de la plataforma

router.post('/parqueadero/crear', WebParkingController.NewParking);               // se realiza la creacion de parqueadero
router.post('/parqueadero/actualizar', WebParkingController.UpdateParking);       // se realiza la actualización de parqueadero
router.post('/parqueadero/listar', WebParkingController.InfoParking);             // se obtiene la lista  de parqueaderos
router.post('/autenticacion/historial', WebParkingController.HistorialAuth);             // se obtiene la lista  de parqueaderos

//:::::::::::::::::::::::::::  CONTROLLER APP :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: 
//router.post('/aplicacion/sincronizar', AppSyncController.Sync);                // se sincroniza la información de la app



module.exports = router;