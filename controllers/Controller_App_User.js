const MongoDB = require('../database/connect_mongodb.js');
const Jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const CryptoJS = require("crypto-js");

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
}



  module.exports = {
    NewUser,
    ValidateJWT
    
  };