/*
titre : deleteNotification
role  : 1) vérifier la requête POST
        2) préparer les informations pour supprimé la notif de la db
        3) supprimer la notif à la db
        4) retourne "ok" si tout c'est bien passé et une erreur si il y a eu un problème
*/

// Imports
import { isRequestPOST, log, toObjectID, getConnectedUserID } from '../technicals/technicals.js';

const isDeleteNotificationFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour créer une notif sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.notificationID!==undefined
}

export const deleteNotification = (database, req, callback) => {
    /*
        DEF  : On supprime la notif avec les données dans la requête POST et on callback soit un array "ok", soit une erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(string))
        CALLBACK : callback(Array<string>)/code d'erreur (Array<string>|string)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                   // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(["ERROR", "BAD_REQUEST"]);                      // est-ce que req.body est défini (POST)
    if(!isDeleteNotificationFormDataValid(req)) return callback(["ERROR", "BAD_REQUEST"]);  // 

    const notificationID_toObjectID = toObjectID(req.body.notificationID);
    if(notificationID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);           // la notificationID fournie ne peut pas être transformé en mongodb.ObjectID

    database.collection("notifications").deleteOne({ 
        _id: notificationID_toObjectID,
        userID: userID_toObjectID
    }, function(err, res) {
        if (err || !res) return log("SERVICE_ERROR", true); // Erreur reliée à mongoDB
        return callback(["OK", ""]);
    });

}
