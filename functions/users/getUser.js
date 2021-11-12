/*
titre : getUser
role  : 1) callback les données de l'utilisateur avec l'userID fourni
*/

// Imports
import { log, toObjectID } from '../technicals/technicals.js';

export const getUser = (database, userID, callback) => {
    /*
        DEF  : On cherche un utilisateur avec l'userID fourni et on callback soit null si il n'existe pas, soit ses donénes (sans hashedPassword)
        PRE  : database (mongodb.Db) | userID (mongodb.ObjectID sous forme de string) | callback (Function(False|string))
        CALLBACK : null|données de l'utilisateur demandé
    */

    const userID_toObjectID = toObjectID(userID);

    if(userID_toObjectID==="") return callback(null); // l'userID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("users").findOne({ _id: userID_toObjectID }, function(err, user) {

        if(err) return callback(null);      // Erreur reliée à mongoDB
        if(!user) return callback(null);    // Pas d'utilisateur pour cet userID

        log("User fetched, ID:"+user._id.toString());
        return callback({
            ...user,
            hashedPassword: undefined
        }); // Aucune erreur (on évite d'envoyer hashedPassword)
 
    });

}
