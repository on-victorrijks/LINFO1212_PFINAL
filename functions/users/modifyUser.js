/*
titre : modifyUser
role  : 1) vérifier la requête POST
        2) vérifier les informations de connexion fournies
        3) préparer les informations pour la db
        4) modifier l'utilisateur dans la db
*/

// Imports
import bcrypt from "bcrypt";
import { getConnectedUserID, isPasswordValid, isRequestPOST, log, toObjectID } from '../technicals/technicals.js';

// Constants
const saltRounds = 10;

const isModifyUserFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour modifier un utilisateur sont dans la requête POST et utilisables (mots de passe égaux)
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.actual_password!==undefined && 
            req.body.firstname!==undefined && 
            req.body.lastname!==undefined &&
            req.body.phonenumber!==undefined &&
            req.body.companyName!==undefined &&
            req.body.password!==undefined &&
            req.body.password_verif!==undefined &&
            req.body.password===req.body.password_verif 
}

export const modifyUser = (database, req, callback) => {
    /*
        DEF  : On vérifie les informations de connexion et on modifie l'utilisateur connecté avec les données dans la requête POST, on callback en cas d'erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : existance d'une erreur/code d'erreur (False|string)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback("BAD_REQUEST");                                                  // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback("BAD_REQUEST");                                                     // est-ce que req.body est défini (POST)
    if(!isModifyUserFormDataValid(req)) return callback("BAD_REQUEST");                                         // est-ce que les données nécessaires pour modifier un utilisateur sont dans la requête POST et utilisables
    const userWantsToChangePassword = req.body.password !== "";                                                 // est-ce que l'utilisateur veut changer de mot de passe ?
    if(userWantsToChangePassword && !isPasswordValid(req.body.password)) return callback("PASSWORD_INVALID")    // est ce que le mot de passe est valide (6 <= password.length <= 256)

    
    database.collection("users").findOne({ _id: userID_toObjectID }, function(err, user) {

        if(err) return callback("SERVICE_PROBLEM"); // Erreur reliée à mongoDB

        // Si l'utilisateur n'existe pas ou que le mot de passe n'est pas correct on callback une erreur
        if(!(user && bcrypt.compareSync(req.body.actual_password, user.hashedPassword))) return callback("BAD_CREDENTIALS");

        // Si l'utilisateur veut changer de mot de passe, on hash celui-ci, sinon on utilise le mot de passe actuel
        const hashedPassword = userWantsToChangePassword ? bcrypt.hashSync(req.body.password, saltRounds) : user.hashedPassword;

        const modifiedUser = {
            $set: {
                firstname: req.body.firstname!=="" ? req.body.firstname : user.firstname,
                lastname: req.body.lastname!=="" ? req.body.lastname : user.lastname,
                phonenumber: req.body.phonenumber!=="" ? req.body.phonenumber : user.phonenumber,
                companyName: req.body.companyName!=="" ? req.body.companyName : user.companyName,
                hashedPassword: hashedPassword,
            }
        } 

        database.collection("users").updateOne({ _id: userID_toObjectID }, modifiedUser, function(err, res) {
            if(err) return callback("BAD_REQUEST");     // Erreur reliée à mongoDB
            log("User modified, ID:" + res.insertedId);
            return callback(false);                     // Aucune erreur
        });

    }); 
}
