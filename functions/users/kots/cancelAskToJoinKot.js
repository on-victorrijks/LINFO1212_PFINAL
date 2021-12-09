/*
titre : cancelAskToJoinKot
role  : 1) Vérifie la requête POST
        2) Supprime dans la db la demande de rjoindre un kot 
*/

// Imports
import { isUserConnected } from '../../../protections/isUserConnected.js';
import { deleteNotificationFromPreviousAskToJoin } from '../../notifications/deleteNotificationFromPreviousAskToJoin.js';
import { isRequestPOST, log, toObjectID, getConnectedUserID } from '../../technicals/technicals.js';

const isCancelAskToJoinKotFormDataValid = (req) => {
    /*
        DEF  : Vérifie que les donées sont dans la requête POST et qu'elles sont utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.kotID!==undefined
}

export const cancelAskToJoinKot = (database, req, callback) => {
    /*
        DEF  : supprime de la db la demande de rejoindre un kot
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)| callback (Function(string))
        CALLBACK : Array<"OK"|"ERROR", any>
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
