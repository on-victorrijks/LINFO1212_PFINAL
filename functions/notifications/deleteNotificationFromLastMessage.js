/*
titre : deleteNotificationFromLastMessage
role  : 1) 
*/

// Imports
import { log } from '../technicals/technicals.js';

export const deleteNotificationFromLastMessage = (database, convID, userID, mustNotDeleteNotificationID) => {
    /*
        DEF  :
        PRE  :
        CALLBACK :
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
