/*
titre : getTenants
role  : 1) 
*/

// Imports
import { isRequestPOST, log, toObjectID } from '../technicals/technicals.js';

const isGetTenantsFormDataValid = (req) => {
    /*
        DEF  : 
        PRE  : 
        POST : 
    */
    return  req.body.kotID!==undefined
}

export const getTenants = (database, req, callback) => {
    /*
        DEF  : 
        PRE  : database (mongodb.Db) | kotID (mongodb.ObjectID sous forme de string) | connectedUserShouldBeCreator (boolean) | callback (Function(False|string)) (//FIX ADD REQ)
        CALLBACK : 
    */


    if(!isRequestPOST(req)) return callback(['ERROR', 'REQUEST']);                        // est-ce que req.body est défini (POST)
    if(!isGetTenantsFormDataValid(req)) return callback(['ERROR', 'REQUEST']);            // est-ce que les données nécessaires pour récupérer les données des colocataires d'un kot sont disponibles et utilisables

    const kotID_toObjectID = toObjectID(req.body.kotID);
    if(kotID_toObjectID==="") return callback(['ERROR', 'REQUEST']); // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("kots").findOne({ _id: kotID_toObjectID }, function(err, kot) {

        if(err) return callback(['ERROR', 'SERVICE_ERROR']);      // Erreur reliée à mongoDB
        if(!kot) return callback(['ERROR', 'BAD_KOTID']);     // Pas de kot pour ce kotID
        
        const tenantsIDs = kot.collocationData.tenantsID;

        database.collection("users").find({ _id: { $in: tenantsIDs } }).toArray(function(err_users, usersData) {
            if(err_users) return callback(['ERROR', 'SERVICE_ERROR']);
    
            log("Kot ternants fetched, ID:"+kot._id.toString());

            callback(['OK', usersData.map(userData => {
                return {
                ...userData,
                hashedPassword: undefined, // pour garder le secret dans le cas où quelqu'un a un ordinateur très puissant :)
                }
            })]);
    
        });
 
    });

}
