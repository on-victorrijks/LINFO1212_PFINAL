/*
titre : deleteNotificationFromPreviousAskToJoin
role  : 1) préparer les informations pour supprimé la notif lié à la dernière demande de rejoindre un kot reçu de la db
        2) supprimer la notif à la db
        3) renvoie une erreur si il y a eu un problème 
*/

// Imports
import { log } from '../technicals/technicals.js';

export const deleteNotificationFromPreviousAskToJoin = (database, userID, kotID, userID_askingToJoin) => {
    /*
        DEF  : supprime la notification lié au dernier message reçu
        PRE  : database (mongod.Db) | userID (mongodb.ObjectID sous forme de string) | kotID (mongodb.ObjectID sous forme de string) | userID_askingToJoin (mongodb.ObjectID sous forme de string) 
        CALLBACK : code d'erreur (Array<string>|string)
    */

    database.collection("notifications").find({
        userID: userID,
        type: "newAskToJoin"
    }).toArray(function(err, notifications) {
        if (err) return log("SERVICE_ERROR", true); // Erreur reliée à mongoDB

        notifications.forEach(notification => {
            try{
                if(
                    notification.datapoints[0].toString() === kotID.toString() &&
                    notification.datapoints[1].toString() === userID_askingToJoin.toString()
                ){

                    database.collection("notifications").deleteOne({ _id: notification._id }, function(err, res) {
                        if (err || !res) return log("SERVICE_ERROR", true); // Erreur reliée à mongoDB
                    });

                    return;
                }
            } catch { /* PASS */ }
        });

    });

}