/*
titre : cancelAskToJoinKot
role  : 1) 
*/

// Imports
import { isUserConnected } from '../../../protections/isUserConnected.js';
import { deleteNotificationFromPreviousAskToJoin } from '../../notifications/deleteNotificationFromPreviousAskToJoin.js';
import { isRequestPOST, log, toObjectID, getConnectedUserID } from '../../technicals/technicals.js';

const isCancelAskToJoinKotFormDataValid = (req) => {
    /*
        DEF  : 
        PRE  : 
        POST : 
    */
    return  req.body.kotID!==undefined
}

export const cancelAskToJoinKot = (database, req, callback) => {
    /*
        DEF  :
        PRE  :
        CALLBACK :
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(!isUserConnected(req)) return callback(["ERROR", "CONNECTION_NEEDED"]);              //
    if(userID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                   // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(["ERROR", "BAD_REQUEST"]);                      // est-ce que req.body est défini (POST)
    if(!isCancelAskToJoinKotFormDataValid(req)) return callback(["ERROR", "BAD_REQUEST"]);  // 

    const kotID_toObjectID = toObjectID(req.body.kotID);
    if(kotID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("kots").findOne({ _id: kotID_toObjectID }, function(err, kot) {
        
        if(err) return callback(["ERROR", "SERVICE_PROBLEM"]);  // Erreur reliée à mongoDB
        if(!kot) return callback(["ERROR", "BAD_KOTID"]);       // Pas de kot pour ce kotID

        database.collection("askToJoin").deleteOne({ kotID: kotID_toObjectID, userID: userID_toObjectID }, function(err, askToJoin) {
            if (err || !askToJoin) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB ou pas l'utilisateur n'a pas demandé à rejoindre ce kot
    
            // On supprime la notification que le propriétaire du kot a précédemment reçu
            deleteNotificationFromPreviousAskToJoin(database, kot.creatorID, kot._id, userID_toObjectID);
    
            return callback(["OK", ""]); // Aucune erreur
        });

    });

}
