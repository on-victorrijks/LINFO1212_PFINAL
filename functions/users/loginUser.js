/*
titre : loginUser
role  : 1) vérifier la requête POST
        2) vérifier l'existence d'un utilisteur avec l'adresse email fournie
        3) vérifier le mot de passe fourni
        4) créer le cookie de connexion
*/

// Imports
import bcrypt from "bcrypt";
import { isRequestPOST, log } from '../technicals/technicals.js';

const isLoginUserFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour login un utilisateur sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.email!==undefined && 
            req.body.password!==undefined
}

export const loginUser = (database, req, callback) => {
    /*
        DEF  : On enregiste un nouvel utilisateur avec les données dans la requête POST et on callback en cas d'erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : existance d'une erreur/code d'erreur (False|string)
    */

    if(!isRequestPOST(req)) return callback("BAD_REQUEST");                      // est-ce que req.body est défini (POST)
    if(!isLoginUserFormDataValid(req)) return callback("BAD_REQUEST");           // est-ce que les données nécessaires pour login un utilisateur sont dans la requête POST et utilisables

    database.collection("users").findOne({ email: req.body.email }, function(err, user) {

        if(err) return callback("SERVICE_PROBLEM"); // Erreur reliée à mongoDB

        // Si l'utilisateur n'existe pas ou que le mot de passe n'est pas correct on callback une erreur
        if(!(user && bcrypt.compareSync(req.body.password, user.hashedPassword))) return callback("BAD_CREDENTIALS");

        // Création d'un cookie pour stocker l'userID
        req.session.userID = user._id.toString();
        log("User logged in, ID:"+user._id.toString());
        return callback(false); // Aucune erreur
 
    });

}
