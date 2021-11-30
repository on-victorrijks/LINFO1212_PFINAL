/*
titre : createNotifications
role  : 1) vérifier la requête POST
        2) préparer les informations pour la db
        3) ajouter la notif à la db
        4) renvoyer l'_id de la notif ajouté
*/

// Imports
import { getConnectedUserID, toObjectID, isRequestPOST, log, cutString, toFloat, toBoolean, toInt } from '../technicals/technicals.js';

// Constants


const isCreateNotifFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour créer un kot sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  
}

export const createKot = (database, req, mainPictureIndex, filteredPicturesName, callback) => {
    /*
        DEF  : On enregiste une nouvelle notif avec les données dans la requête POST et on callback soit un array contenant l'_id de la notif, soit une erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | mainPictureIndex (number) | filteredPicturesName (Array<string>) | callback (Function(string))
        CALLBACK : [_id de la notif ajouté]/code d'erreur (Array<string>|string)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback("BAD_REQUEST");                   // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback("BAD_REQUEST");                      // est-ce que req.body est défini (POST)
    if(!isCreateNotifFormDataValid(req)) return callback("BAD_REQUEST");         // est-ce que les données nécessaires pour créer un kot sont dans la requête POST et utilisables

    //FIX VERIF USER TYPE

    const newNotif = {
        "userID"        : userID_toObjectID,
        "type"          : ,
        "datapoints"    : ,
        "createdOn"     : (new Date()).getTime(),
    };

    // Insertion du kot dans la base de données
    database.collection("notification").insertOne(newNotif, (err, res) => {
        if (err || !res) return callback("SERVICE_PROBLEM")     // Erreur reliée à mongoDB
        log("New notif created, ID:"+res.insertedId);
        return callback([res.insertedId])                       // Aucune erreur
    });
}