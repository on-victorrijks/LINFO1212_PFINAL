/*
titre : registerUser
role  : 1) vérifier la requête POST
        2) préparer les informations pour la db
        3) ajouter l'utilisateur à la db
*/

// Imports
import bcrypt from "bcrypt";
import { isPasswordValid, isRequestPOST, log } from '../technicals/technicals.js';

// Constants
const saltRounds = 10;

const isRegisterUserFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour créer un utilisateur sont dans la requête POST et utilisables (mots de passe égaux)
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.type!==undefined && 
            req.body.firstname!==undefined && 
            req.body.lastname!==undefined &&
            req.body.email!==undefined &&
            req.body.phonenumber!==undefined &&
            req.body.companyName!==undefined &&
            req.body.password!==undefined &&
            req.body.password_verif!==undefined &&
            req.body.password===req.body.password_verif 
}

export const registerUser = (database, req, callback) => {
    /*
        DEF  : On enregiste un nouvel utilisateur avec les données dans la requête POST et on callback en cas d'erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : existance d'une erreur/code d'erreur (False|string)
    */

    if(!isRequestPOST(req)) return callback("BAD_REQUEST");                      // est-ce que req.body est défini (POST)
    if(!isRegisterUserFormDataValid(req)) return callback("BAD_REQUEST");        // est-ce que les données nécessaires pour créer un utilisateur sont dans la requête POST et utilisables
    if(!isPasswordValid(req.body.password)) return callback("PASSWORD_INVALID")  // est ce que le mot de passe est valide (6 <= password.length <= 256)

    database.collection("users").findOne({ email: req.body.email }, function(err, user) {

        if(err) return callback("SERVICE_PROBLEM"); // Erreur reliée à mongoDB
        if(user) return callback("EMAIL_IN_USE");   // L'email est déjà utilisé

        // On hash le mot de passe
        const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);

        const newUser = {
            "firstname"     : req.body.firstname,
            "lastname"      : req.body.lastname,
            "createdOn"     : (new Date()).getTime(),
            "email"         : req.body.email,
            "phonenumber"   : req.body.phonenumber,
            "profilPicture" : "$DEFAULT",
            "type"          : req.body.type==="landlord" ? "landlord" : "resident",
            "companyName"   : req.body.companyName,
            "hashedPassword": hashedPassword
        };
    
        // Insertion de l'utilisateur dans la base de données
        database.collection("users").insertOne(newUser, (err, res) => {
            if (err || !res) return callback("SERVICE_PROBLEM")     // Erreur reliée à mongoDB
            log("New user created, ID:"+res.insertedId);
            return callback(false)                                  // Aucune erreur
        });

    }); 

}
