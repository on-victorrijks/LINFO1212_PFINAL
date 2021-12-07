/*
titre : createNotification
role  : 1) préparer les informations pour la db
        2) ajouter la notif à la db
        3) renvoyer l'_id de la notif ajouté
*/

// Imports
import { log } from '../technicals/technicals.js';

// Constants


export const createNotification = (database, userID, type, datapoints, callback) => {
    /*
        DEF  : On enregiste une nouvelle notif avec les données dans la requête POST et on callback soit un array contenant l'_id de la notif, soit une erreur
        PRE  : database (mongodb.Db) | userID (mongodb.ObjectID sous forme de string) | type Array<string> | datapoints Array<string> | callback (Function(string))
        CALLBACK : [_id de la notif ajouté]/code d'erreur (Array<string>|string)
    */


    //FIX VERIF USER TYPE

    const newNotif = {
        "userID"        : userID,
        "type"          : type,
        "datapoints"    : datapoints,
        "createdOn"     : (new Date()).getTime(),
    };

    // Insertion de la notif dans la base de données
    database.collection("notifications").insertOne(newNotif, (err, res) => {
        if (err || !res) return callback("SERVICE_PROBLEM")     // Erreur reliée à mongoDB
        log("New notif created, ID:"+res.insertedId);
        return callback(res.insertedId);
    });
}