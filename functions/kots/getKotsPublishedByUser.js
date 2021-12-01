/*
titre : getKotsPublishedByUser
role  : 
*/

// Imports
import { log, toObjectID } from '../technicals/technicals.js';

export const getKotsPublishedByUser = (database, userID, success, error) => {
    /*
        DEF  : 
        PRE  : 
        CALLBACK : 
    */

    const userID_toObjectID = toObjectID(userID);

    if(userID_toObjectID==="") return error("BAD_USERID"); // l'userID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("kots").find({ creatorID: userID_toObjectID }).sort({ createdOn: -1 }).toArray(function(err, kots) {

        if(err) return error("SERVICE_ERROR");      // Erreur reliée à mongoDB
        if(!kots) return success([]);     // Pas de kot pour cet userID

        log("Kots fetched for userID:" + userID_toObjectID.toString());
        return success(kots.map((kot) => {
            return {
                ...kot,
                mainPictureName: kot.pictures[kot.mainPictureIndex]
            }
        })); // Aucune erreur
 
    });

}