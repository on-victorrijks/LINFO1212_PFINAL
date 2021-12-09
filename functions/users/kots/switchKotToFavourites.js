/*
titre : switchKotToFavourites
role  : 1) Vérifie la requête POST
        2) on supprime le kot des favoris de l'utilisateur  
*/

// Imports
import { isUserConnected } from '../../../protections/isUserConnected.js';
import { isRequestPOST, log, toObjectID, getConnectedUserID } from '../../technicals/technicals.js';

const isSwitchKotToFavouritesFormDataValid = (req) => {
    /*
        DEF  : Vérifie que les donées sont dans la requête POST et qu'elles sont utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean 
    */
    return  req.body.kotID!==undefined
}

export const switchKotToFavourites = (database, req, callback) => {
    /*
        DEF  : on supprime le kot des favoris de l'utilisateur 
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)| callback (Function(string))
        CALLBACK : CALLBACK : Array<"OK"|"ERROR", any>
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(!isUserConnected(req)) return callback(["ERROR", "CONNECTION_NEEDED"]);
    if(userID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                     // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(["ERROR", "BAD_REQUEST"]);                        // est-ce que req.body est défini (POST)
    if(!isSwitchKotToFavouritesFormDataValid(req)) return callback(["ERROR", "BAD_REQUEST"]);          // est-ce que les données nécessaires pour créer un utilisateur sont dans la requête POST et utilisables

    const kotID_toObjectID = toObjectID(req.body.kotID);
    if(kotID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                     // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("savedKots").findOne({ userID: userID_toObjectID, kotID: kotID_toObjectID }, function(err, savedKot) {

        if(err) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
        if(savedKot){
            // On supprime le kot des favoris
            database.collection("savedKots").deleteOne({ _id: savedKot._id }, function(err, kot) {
                if (err || !kot) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
                return callback(["OK", ""]); // Aucune erreur
            });
        } else {
            // On ajoute le kot aux favoris
            const newSavedKot = {
                "createdOn"     : (new Date()).getTime(),
                "userID"        : userID_toObjectID,
                "kotID"         : kotID_toObjectID
            };
        
            // Insertion de l'utilisateur dans la base de données
            database.collection("savedKots").insertOne(newSavedKot, (err, res) => {
                if (err || !res) return callback(["ERROR", "SERVICE_PROBLEM"])     // Erreur reliée à mongoDB
                log("New savedKot added, ID:"+res.insertedId);
                return callback(["OK", ""])                                  // Aucune erreur
            });
        }

    }); 

}
