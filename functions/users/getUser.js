/*
titre : getUser
role  : 1) callback les données de l'utilisateur avec l'userID fourni
*/

// Imports
import { log, toObjectID } from '../technicals/technicals.js';

export const getUser = (database, userID, userShouldBeLandlord, success, error) => {
    /*
        DEF  : On cherche un utilisateur avec l'userID fourni et on callback soit null si il n'existe pas, soit ses données (sans hashedPassword)
        PRE  : database (mongodb.Db) | userID (mongodb.ObjectID sous forme de string) | userShouldBeLandlord (boolean) | success (Function(user)) | error (Function(errorCode))
        CALLBACK : null|données de l'utilisateur demandé
    */
        
    const userID_toObjectID = toObjectID(userID);
    if(userID_toObjectID==="") return error("BAD_USERID"); // l'userID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("users").findOne({ _id: userID_toObjectID }, function(err, user) {

        if(err) return error("SERVICE_ERROR"); // Erreur reliée à mongoDB
        if(!user) return success(null);        // Pas d'utilisateur pour cet userID

        if(userShouldBeLandlord){
            if(user.type !== "landlord") return error("NOT_LANDLORD");
        }

        log("User fetched, ID:"+user._id.toString());
        return success({
            ...user,
            hashedPassword: undefined
        }); // Aucune erreur (on évite d'envoyer hashedPassword)
 
    });

}
