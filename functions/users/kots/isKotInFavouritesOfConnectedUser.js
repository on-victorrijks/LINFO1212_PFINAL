/*
titre : isKotInFavouritesOfConnectedUser
role  : 1) callback true si le kot avec l'_id kotID est dans les favoris de l'utilisateur connecté, sinon callback false
*/

// Imports
import { errorHandler } from '../../../errorHandler/errorHandler.js';
import { getConnectedUserID, toObjectID } from '../../technicals/technicals.js';

export const isKotInFavouritesOfConnectedUser = (database, req, kotID, callback) => {
    /*
        DEF  : On vérifie si le kot avec l'_id kotID est dans les favoris de l'utilisateur connecté
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | kotID (mongodb.ObjectID) | callback (Function(boolean))
        CALLBACK : boolean
    */
        
    const userID_toObjectID = toObjectID(getConnectedUserID(req));
    if(userID_toObjectID==="") return callback(false); // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID

    const kotID_toObjectID = toObjectID(kotID);
    if(kotID_toObjectID==="") return callback(false); // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("savedKots").findOne({ userID: userID_toObjectID, kotID: kotID_toObjectID }, function(err, savedKot) {

        if(err) {
            errorHandler("SERVICE_ERROR");
            return callback(false);
        }; // Erreur reliée à mongoDB

        return callback(savedKot);
 
    });

}
