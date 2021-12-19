/*
titre : hasUserAskedToJoinThisKot
role  : 1) callback true si l'utilisateur connecté a demandé à rejoindre le kot avec l'_id kotID, sinon on callback false
*/

// Imports
import { errorHandler } from '../../../errorHandler/errorHandler.js';
import { getConnectedUserID, toObjectID } from '../../technicals/technicals.js';

export const hasUserAskedToJoinThisKot = (database, req, kotID, callback) => {
    /*
        DEF  : On vérifie si l'utilisateur connecté a demandé à rejoindre le kot avec l'_id kotID, on callback le résultat de cette vérification
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | kotID (mongodb.ObjectID) | callback (Function(boolean))
        CALLBACK : boolean
    */
        
    const userID_toObjectID = toObjectID(getConnectedUserID(req));
    if(userID_toObjectID==="") return callback(false); // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID

    const kotID_toObjectID = toObjectID(kotID);
    if(kotID_toObjectID==="") return callback(false); // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("askToJoin").findOne({ userID: userID_toObjectID, kotID: kotID_toObjectID }, function(err, askToJoin) {

        if(err) {
            errorHandler("SERVICE_ERROR");
            return callback(false);
        }; // Erreur reliée à mongoDB

        return callback(askToJoin);
 
    });

}
