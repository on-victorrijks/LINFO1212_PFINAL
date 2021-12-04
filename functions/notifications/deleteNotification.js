/*
titre : deleteNotification
role  : 1) 
*/

// Imports
import { isRequestPOST, log, toObjectID, getConnectedUserID } from '../technicals/technicals.js';

const isDeleteNotificationFormDataValid = (req) => {
    /*
        DEF  : 
        PRE  : 
        POST : 
    */
    return  req.body.notificationID!==undefined
}

export const deleteNotification = (database, req, callback) => {
    /*
        DEF  :
        PRE  :
        CALLBACK :
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
