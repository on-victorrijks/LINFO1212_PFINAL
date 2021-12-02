/*
titre : deleteNotificationFromPreviousAskToJoin
role  : 1) 
*/

// Imports
import { log } from '../technicals/technicals.js';

export const deleteNotificationFromPreviousAskToJoin = (database, userID, kotID, userID_askingToJoin) => {
    /*
        DEF  :
        PRE  :
        CALLBACK :
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