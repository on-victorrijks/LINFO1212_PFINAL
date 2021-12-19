/*
titre : getNotifications
role  : 1) callback les notifications pour l'utilisateur connecté
*/

// Imports
import { isUserConnected } from '../../protections/isUserConnected.js';
import { getConnectedUserID, log, toObjectID } from '../technicals/technicals.js';
import { getUser } from '../users/getUser.js';

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
            case "newAskToJoin":
                return [
                    {
                        title: "Voir mes kots",
                        redirectTo: "/kot/my/?selectedKotID="+notification.datapoints[0]
                    }
                ]
            default:
                return []
        }
    } catch {
        return []
    }
}

const getUIData = (database, notification, callback) => {
    try{
        switch (notification.type){
            case "newMessage":
                getUser(database, notification.datapoints[1], false, 
                (user) => {
                    return callback({
                        title: `Nouveau message de ${user.firstname} ${user.lastname}`,
                        description: notification.datapoints[2],
                    })
                }, (error) => { 
                    log(error, true);
                    return callback({
                        title: "Nouveau message",
                        description: `Message disponible dans l'onglet "Messages"`,
                    })
                });
                break;
            case "newAskToJoin":
                getUser(database, notification.datapoints[1], false, 
                (user) => {
                    return callback({
                        title: `Nouvelle demande pour : ${notification.datapoints[2]}`,
                        description: `${user.firstname} ${user.lastname} souhaite rejoindre votre kot`,
                    })
                }, (error) => { 
                    log(error, true);
                    return callback({
                        title: `Nouvelle demande pour : ${notification.datapoints[2]}`,
                        description: `Un utilisateur souhaite rejoindre votre kot`,
                    })
                });
                break;
            case "askToJoinAccepted":
                return callback({
                    title: `Demande acceptée : ${notification.datapoints[1]}`,
                    description: `Votre demande pour rejoindre le kot "${notification.datapoints[1]}" a été acceptée`,
                })
                break;
            case "askToJoinRefused":
                return callback({
                    title: `Demande refusée : ${notification.datapoints[1]}`,
                    description: `Votre demande pour rejoindre le kot "${notification.datapoints[1]}" a été refusée`,
                })
                break;
        }
    } catch {
        /* 
        Le try-catch est utilisé car nous utilisons la propriété "datapoints" de l'objet notification, 
        cet objet nous permet de transmettre tout type de données et toute quantité de données mais
        il apporte de l'incertitude
        */ 
        return callback({
            title: "Nouvelle notification",
            description: "",
        })
    }
}

export const getConnectedUserNotifications = (database, req, callback) => {
    /*
        DEF  : On cherche les notifications de l'utilisateur connecté et on les callback
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : Array<"OK"|"ERROR", any>
    */

    if(!isUserConnected(req)) return callback(["ERROR", "CONNECTION_NEEDED"]);      // l'utilisateur doit être connecté
    const userID_toObjectID = toObjectID(getConnectedUserID(req));
    if(userID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);           // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID

    database.collection("notifications").find({ userID: userID_toObjectID }).toArray(function(err, notifications) {

        if(err) return callback(["ERROR", "SERVICE_ERROR"]);      // Erreur reliée à mongoDB
        if(notifications===null) return callback(["OK", []]);     // Pas de notification pour l'utilisateur connecté

        log("Notification fetched, ID:"+userID_toObjectID.toString());
        
        const formattedNotifications = [];

        for (let index = 0; index < notifications.length; index++) {
            const notification = notifications[index];
            
            getUIData(database, notification, (UIData) => {

                formattedNotifications.push({
                    ...notification,
                    UIData: UIData,
                    buttons: getButtonsForNotificationData(notification)
                });
                
                if((index + 1) === notifications.length){
                    return callback(["OK", formattedNotifications]); // Aucune erreur
                }

            })

        }

    });

}
