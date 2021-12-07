/*
titre : deleteNotificationFromLastMessage
role  : 1) préparer les informations pour supprimé la notif lié au dernier message reçu de la db
        2) supprimer la notif à la db
        3) renvoie une erreur si il y a eu un problème 
*/

// Imports
import { log } from '../technicals/technicals.js';

export const deleteNotificationFromLastMessage = (database, convID, userID, mustNotDeleteNotificationID) => {
    /*
        DEF  : supprime la notification lié au dernier message reçu
        PRE  : database (mongod.Db) | convID (mongodb.ObjectID sous forme de string) | userID (mongodb.ObjectID sous forme de string) | mustNotDeleteNotificationID (mongodb.ObjectID sous forme de string) 
        CALLBACK : code d'erreur (Array<string>|string)
    */

    database.collection("notifications").find({
        userID: userID,
        type: "newMessage"
    }).toArray(function(err, notifications) {
        if (err) return log("SERVICE_ERROR", true); // Erreur reliée à mongoDB

        notifications.forEach(notification => {
            try{
                if(
                    notification.datapoints[0].toString() === convID.toString() &&
                    notification._id.toString() !== mustNotDeleteNotificationID.toString()
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
