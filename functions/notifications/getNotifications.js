/*
titre : getNotifications
role  : 1) callback les données de la notif avec le notifID fourni
*/

// Imports
import { getConnectedUserID, log, toObjectID } from '../technicals/technicals.js';

export const getNotifications = (database, req, notifID, success, error) => {
    /*
        DEF  : On cherche une notif avec le notifID fourni et on callback soit null si elle n'existe pas, soit ses données
        PRE  : database (mongodb.Db) | notifID (mongodb.ObjectID sous forme de string) | callback (Function(False|string)) (//FIX ADD REQ)
        CALLBACK : null|données de de la notif demandée
    */

    const notifID_toObjectID = toObjectID(notifID);

    if(notifID_toObjectID==="") return error("BAD_KOTID"); // le notifID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("notification").findOne({ _id: notifID_toObjectID }, function(err, notification) {

        if(err) return error("SERVICE_ERROR");      // Erreur reliée à mongoDB
        if(!notification) return error("BAD_KOTID");     // Pas de notification pour ce notifID

        log("Notification fetched, ID:"+notification._id.toString());
        
        return success({
            ...notification
        }); // Aucune erreur
 
    });

}
