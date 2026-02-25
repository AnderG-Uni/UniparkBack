const MongoDB = require('../database/connect_mongodb.js');
const Auth = require('./Controller_Web_Auth.js');
const { ObjectId } = require('mongodb');



//------------- metodo  para listar todos los vehiculos por usuario --------------------- TERMINDO, validado
const HistoryIngress = async (req, res) => {
        try {
            const datos = req.body;
            const vehiculos = await MongoDB.db('Unipark').collection('autenticacion').find({id_usuario: new ObjectId(datos.IDUSER)}).toArray();
    
            if (Object.keys(vehiculos).length == 0) {
                return res.status(404).json({ status: "Sin datos", message: "No hay vehículos registrados." });
            }
    
            res.status(200).json({ status: "OK", vehiculos });
    
        } catch (error) {
            console.error('Error al listar vehículos:', error);
            res.status(500).json({ status: "Error", message: "Error interno del servidor." });
        }
};


  

module.exports = {
    HistoryIngress,
  };