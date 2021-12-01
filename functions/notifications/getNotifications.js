/*
titre : getNotifications
role  : 1) callback les données de la notif avec le notifID fourni
*/

// Imports
import { isUserConnected } from '../../protections/isUserConnected.js';
import { getConnectedUserID, log, toObjectID } from '../technicals/technicals.js';

const getButtonsForNotificationData = (notification) => {
    try{
        switch (notification.type){
            case "newMessage":
                return [
                    {
                        title: "Voir la conversation",
                        redirectTo: "/conversations/?selectedConversationID="+notification.datapoints[0]
                    }
                ]
            default:
                return []
        }
    } catch {
        return []
    }
}

const getTitleFromNotificationData = (notification) => {
    try{
        switch (notification.type){
            case "newMessage":
                return "Nouveau message !"
            default:
                return "Nouvelle notification"
        }
    } catch {
        return "Nouvelle notification"
    }
}

const getDescFromNotificationData = (notification) => {
    try{
        switch (notification.type){
            case "newMessage":
                return notification.datapoints[2]
            default:
                return ""
        }
    } catch {
        return ""
    }
}

export const getConnectedUserNotifications = (database, req, callback) => {
    /*
        DEF  : On cherche les notifications de l'utilisateur connecté et on les callback
        PRE  : database (mongodb.Db) | callback (Function(False|string)) (//FIX ADD REQ)
        CALLBACK : Array<NotifObject> //FIX
    */

    if(!isUserConnected(req)) return callback(["ERROR", "CONNECTION_NEEDED"]);      // l'utilisateur doit être connecté
    const userID_toObjectID = toObjectID(getConnectedUserID(req));
    if(userID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);           // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID

    database.collection("notifications").find({ userID: userID_toObjectID }).toArray(function(err, notifications) {

        if(err) return callback(["ERROR", "SERVICE_ERROR"]);      // Erreur reliée à mongoDB
        if(notifications===null) return callback(["OK", []]);     // Pas de notification pour l'utilisateur connecté

        log("Notification fetched, ID:"+userID_toObjectID.toString());
        
        return callback(["OK", notifications.map(notification => {
            return {
                ...notification,
                title: getTitleFromNotificationData(notification),
                description: getDescFromNotificationData(notification),
                buttons: getButtonsForNotificationData(notification)
            }
        })]); // Aucune erreur
 
    });

}
