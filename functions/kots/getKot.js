/*
titre : getKot
role  : 1) callback les données du kot avec le kotID fourni
*/

// Imports
import { log, toObjectID } from '../technicals/technicals.js';

export const getKot = (database, kotID, callback) => {
    /*
        DEF  : On cherche un kot avec le kotID fourni et on callback soit null si il n'existe pas, soit ses données
        PRE  : database (mongodb.Db) | kotID (mongodb.ObjectID sous forme de string) | callback (Function(False|string))
        CALLBACK : null|données de lu kot demandé
    */

    const kotID_toObjectID = toObjectID(kotID);

    if(kotID_toObjectID==="") return callback(null); // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("kots").findOne({ _id: kotID_toObjectID }, function(err, kot) {

        if(err) return callback(null);      // Erreur reliée à mongoDB
        if(!kot) return callback(null);     // Pas de kot pour ce kotID

        log("Kot fetched, ID:"+kot._id.toString());
        return callback(kot); // Aucune erreur
 
    });

}
