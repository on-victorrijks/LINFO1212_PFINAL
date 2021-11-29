/*
titre : getUserFavouritesKots
role  : 
*/

// Imports
import { log, toObjectID } from '../../technicals/technicals.js';

export const getUserFavouritesKots = (database, userID, success, error) => {
    /*
        DEF  : 
        PRE  : 
        CALLBACK : 
    */

    const userID_toObjectID = toObjectID(userID);

    if(userID_toObjectID==="") return error("BAD_USERID"); // l'userID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("savedKots").find({ userID: userID_toObjectID }).sort({ createdOn: -1 }).toArray(function(errFavs, favKots) {
        if(errFavs) return error("SERVICE_ERROR");      // Erreur reliée à mongoDB

        const favKotsIDS = favKots.map((favKot) => {return favKot.kotID});
        database.collection("kots").find({ _id: { $in: favKotsIDS } }).toArray(function(err, kots) {

            if(err) return error("SERVICE_ERROR");      // Erreur reliée à mongoDB
            if(!kots) return success([]);     // Pas de kot pour cet userID

            log("Favourites kots fetched for userID:" + userID_toObjectID.toString());
            return success(kots.map((kot) => {
                return {
                    ...kot,
                    mainPictureName: kot.pictures[kot.mainPictureIndex]
                }
            })); // Aucune erreur
    
        });
    });

}
