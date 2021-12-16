/*
titre : removeTenant
role  : 1) Vérifie la requête POST
        2) Supprime le colocataire de la liste des colocatzire du kot
*/

// Imports
import { isUserConnected } from '../../protections/isUserConnected.js';
import { isRequestPOST, log, toObjectID, getConnectedUserID } from '../technicals/technicals.js';

const isRemoveTenantFormDataValid = (req) => {
    /*
        DEF  : vérifie si les donées sont dans la requête POST et sont utilisables pour supprimer le colocataire
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.kotID!==undefined &&
            req.body.userID_toRemove!==undefined
}

export const removeTenant = (database, req, callback) => {
    /*
        DEF  : retire l'userID de la liste des colocataire du kot et modifie les donées du kot dans la db
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(string))
        CALLBACK : Array<"OK"|"ERROR", any>
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(!isUserConnected(req)) return callback(["ERROR", "CONNECTION_NEEDED"]);              //
    if(userID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                   // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(["ERROR", "BAD_REQUEST"]);                      // est-ce que req.body est défini (POST)
    if(!isRemoveTenantFormDataValid(req)) return callback(["ERROR", "BAD_REQUEST"]);        // 

    const kotID_toObjectID = toObjectID(req.body.kotID);
    if(kotID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                    // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    const userID_toRemove_toObjectID = toObjectID(req.body.userID_toRemove);
    if(userID_toRemove_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);          // l'userID de la personne qui souhaite rejoindre n'est pas correct

    database.collection("kots").findOne({ _id: kotID_toObjectID, creatorID: userID_toObjectID }, function(err, kot) {
        
        if(err) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
        if(!kot) return callback(["ERROR", "BAD_KOTID"]); // Pas de kot pour ce kotID

        const indexOfTenantToRemove = kot.collocationData.tenantsID.findIndex(tenantID => tenantID.toString() === userID_toRemove_toObjectID.toString());
    
        if(indexOfTenantToRemove === -1) return callback(["ERROR", "BAD_USERID"]); // L'utilisateur a enlever n'est pas dans les colocataires

        kot.collocationData.tenantsID.splice(indexOfTenantToRemove, 1);

        const modifiedKot = {
            $set: {
                "collocationData.tenantsID" : kot.collocationData.tenantsID
            }
        };

        const modifiedUser = {
            $set: {
                "isInKot"   : false,
                "actualKot" : undefined
            }
        };

        // Modification de l'utilisateur qui a été enlevé du kot
        database.collection("users").updateOne({ _id: userID_toRemove_toObjectID }, modifiedUser, function(err_users_modify, res) {
            if(err_users_modify) return callback(["ERROR", "SERVICE_PROBLEM"]);    // Erreur reliée à mongoDB
        });

        // Modification du kot dans la base de données
        database.collection("kots").updateOne({ _id: kotID_toObjectID }, modifiedKot, function(err_kots_modify, res) {
            if(err_kots_modify) return callback(["ERROR", "SERVICE_PROBLEM"]);     // Erreur reliée à mongoDB
            
            log("Tenant removed from kot, ID:" + kotID_toObjectID);
            return callback(["OK", ""]); // Aucune erreur
           
        });

    });

}
