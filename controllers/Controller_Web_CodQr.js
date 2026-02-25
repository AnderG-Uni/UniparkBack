const Jwt = require('jsonwebtoken');
const path = require('path');
const fs = require("node:fs");
const multer = require("multer");
const { createCanvas } = require("canvas");

// Multer
const upload = multer({ dest: "./public/codigosqr" });

const SaveQR = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({message: "No se recibió ninguna imagen."});
        }
        console.log("datos de el QR:", req.file.originalname);

        //renombro el archivo y lo guardo
        const NuevaRuta = path.join(__dirname, `./../public/codigosqr/${req.file.originalname}`) ;
        fs.renameSync(req.file.path, NuevaRuta);
        // creo la url donde se almaceno la nueva imagen publicamente
        const qrUrl = `${req.protocol}://${req.get("host")}/codigosqr/${req.file.originalname}`;
        console.log("url del archivo: ", qrUrl);
        // devuelvo el estado OK
        res.status(200).json({ message: "Codigo QR Guardado exitosamente", qrUrl });

    }catch (error) {
        console.error("Error guardando el QR:", error);
        res.status(500).json({ message: "Error guardando la imagen QR.", error });
    }
}

function ListQR (){
    express.static(this.path.join(__dirname, "codigosqr"));
}

module.exports = {
    upload,
    SaveQR,
    ListQR
    
  };






  //Esta es una prueba de LCMUÑOZ