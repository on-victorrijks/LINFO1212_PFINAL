/*
titre : getKot
role  : 1) callback les données du kot avec le kotID fourni
*/

// Imports
import { getConnectedUserID, log, toObjectID } from '../technicals/technicals.js';

export const getKot = (database, req, kotID, connectedUserShouldBeCreator, success, error) => {
    /*
        DEF  : On cherche un kot avec le kotID fourni et on callback soit null si il n'existe pas, soit ses données
        PRE  : database (mongodb.Db) | kotID (mongodb.ObjectID sous forme de string) | connectedUserShouldBeCreator (boolean) | callback (Function(False|string)) (//FIX ADD REQ)
        CALLBACK : null|données de lu kot demandé
    */

    const kotID_toObjectID = toObjectID(kotID);

    if(kotID_toObjectID==="") return error("BAD_KOTID"); // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("kots").findOne({ _id: kotID_toObjectID }, function(err, kot) {

        if(err) return error("SERVICE_ERROR");      // Erreur reliée à mongoDB
        if(!kot) return error("BAD_KOTID");     // Pas de kot pour ce kotID

        if(connectedUserShouldBeCreator){
            if(kot.creatorID.toString() !== getConnectedUserID(req)) return error("NOT_CREATOR");
        }

        log("Kot fetched, ID:"+kot._id.toString());
        

        return success({
            ...kot,
            canJoinCollocation: kot.isCollocation && kot.collocationData.tenantsID && (kot.collocationData.tenantsID.length < kot.collocationData.maxTenant)
        }); // Aucune erreur
 
    });

}
