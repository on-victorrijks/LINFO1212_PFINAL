/*
titre : refuseAskToJoinKot
role  : 1) 
*/

// Imports
import { isUserConnected } from '../../../protections/isUserConnected.js';
import { getKot } from '../../kots/getKot.js';
import { isRequestPOST, log, toObjectID, getConnectedUserID } from '../../technicals/technicals.js';

const isRefuseAskToJoinKotFormDataValid = (req) => {
    /*
        DEF  : 
        PRE  : 
        POST : 
    */
    return  req.body.kotID!==undefined &&
            req.body.userID_askingToJoin!==undefined
}

export const refuseAskToJoinKot = (database, req, callback) => {
    /*
        DEF  :
        PRE  :
        CALLBACK :
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(!isUserConnected(req)) return callback(["ERROR", "CONNECTION_NEEDED"]);              //
    if(userID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                   // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(["ERROR", "BAD_REQUEST"]);                      // est-ce que req.body est défini (POST)
    if(!isRefuseAskToJoinKotFormDataValid(req)) return callback(["ERROR", "BAD_REQUEST"]);  // 

    const kotID_toObjectID = toObjectID(req.body.kotID);
    if(kotID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                    // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    const userID_askingToJoin_toObjectID = toObjectID(req.body.userID_askingToJoin);
    if(userID_askingToJoin_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);      // l'userID de la personne qui souhaite rejoindre n'est pas correct

    database.collection("kots").findOne({ _id: kotID_toObjectID, creatorID: userID_toObjectID }, function(err, kot) {
        
        if(err) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
        if(!kot) return callback(["ERROR", "BAD_KOTID"]); // Pas de kot pour ce kotID

        database.collection("askToJoin").deleteOne({ kotID: kotID_toObjectID, userID: userID_askingToJoin_toObjectID }, function(err_askToJoin_delete, askToJoin) {
            if (err_askToJoin_delete || !askToJoin) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
            log("AskToJoin refused, ID:" + kotID_toObjectID);
            return callback(["OK", ""]); // Aucune erreur
        });

    });

}
