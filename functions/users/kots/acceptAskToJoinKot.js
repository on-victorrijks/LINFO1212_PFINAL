/*
titre : acceptAskToJoinKot
role  : 1) Vérifie la requête POST
        2) Modifie les donées du kot pour ajouter l'userID dans les colocataires
*/

// Imports
import { isUserConnected } from '../../../protections/isUserConnected.js';
import { addUserToConversation } from '../../message/addUserToConversation.js';
import { createNotification } from '../../notifications/createNotification.js';
import { isRequestPOST, log, toObjectID, getConnectedUserID } from '../../technicals/technicals.js';

const isAcceptAskToJoinKotFormDataValid = (req) => {
    /*
        DEF  : Vérifie que les donées sont dans la requête POST et qu'elles sont utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.kotID!==undefined &&
            req.body.userID_askingToJoin!==undefined
}

export const acceptAskToJoinKot = (database, req, callback) => {
    /*
        DEF  : modifie dans la db les donées du kot en ajoutant l'userID dans la liste des colocataires du kot
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)| callback (Function(string)) 
        CALLBACK : Array<"OK"|"ERROR", any>
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(!isUserConnected(req)) return callback(["ERROR", "CONNECTION_NEEDED"]);              //
    if(userID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                   // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(["ERROR", "BAD_REQUEST"]);                      // est-ce que req.body est défini (POST)
    if(!isAcceptAskToJoinKotFormDataValid(req)) return callback(["ERROR", "BAD_REQUEST"]);  // 

    const kotID_toObjectID = toObjectID(req.body.kotID);
    if(kotID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                    // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    const userID_askingToJoin_toObjectID = toObjectID(req.body.userID_askingToJoin);
    if(userID_askingToJoin_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);      // l'userID de la personne qui souhaite rejoindre n'est pas correct

    database.collection("kots").findOne({ _id: kotID_toObjectID, creatorID: userID_toObjectID }, function(err, kot) {
        
        if(err) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
        if(!kot) return callback(["ERROR", "BAD_KOTID"]); // Pas de kot pour ce kotID

        database.collection("askToJoin").findOne({ kotID: kotID_toObjectID, userID: userID_askingToJoin_toObjectID }, function(err_askToJoin, askToJoin) {

            if(err_askToJoin) return callback(["ERROR", "SERVICE_PROBLEM"]);    // Erreur reliée à mongoDB
            if(!askToJoin) return callback(["ERROR", "BAD_USERIDASKTOJOIN"]);   // L'utilisateur choisi n'a pas demandé à rejoindre ce kot
            if(kot.collocationData.tenantsID.length >= kot.collocationData.maxTenants) return callback(["ERROR", "MAX_TENANTS_REACHED"]);

            const modifiedKot = {
                $set: {
                    "collocationData.tenantsID" : [...kot.collocationData.tenantsID, userID_askingToJoin_toObjectID]
                }
            };
            
            const modifiedUser = {
                $set: {
                    "isInKot"   : true,
                    "actualKot" : kot._id
                }
            };

            // Modification de l'utilisateur qui rejoint le kot dans la base de données
            database.collection("users").updateOne({ _id: userID_askingToJoin_toObjectID }, modifiedUser, function(err_users_modify, res) {
                if(err_users_modify) return callback(["OK", "SERVICE_PROBLEM"]);    // Erreur reliée à mongoDB
            });

            // Ajout du nouveau colocataire à la conversation de kot
            addUserToConversation(database, kot.convID, userID_askingToJoin_toObjectID);

            // Modification du kot dans la base de données
            database.collection("kots").updateOne({ _id: kotID_toObjectID }, modifiedKot, function(err_kots_modify, res) {
                if(err_kots_modify) return callback(["OK", "SERVICE_PROBLEM"]);     // Erreur reliée à mongoDB
            
                database.collection("askToJoin").deleteOne({ kotID: kotID_toObjectID, userID: userID_askingToJoin_toObjectID }, function(err_askToJoin_delete, askToJoin) {
                    if (err_askToJoin_delete || !askToJoin) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
                    log("New tenant added, ID:" + kotID_toObjectID);
                    
                    /* 
                    On crée la notification de la demande acceptée
                    pour le celui qui a fait la demande
                    */
                    createNotification(
                        database,
                        userID_askingToJoin_toObjectID,
                        "askToJoinAccepted",
                        [
                            kot._id,
                            kot.title
                        ],
                        (newlyCreatedNotificationID) => { /* PASS */ }
                    );

                    return callback(["OK", ""]); // Aucune erreur
                });
               
            });


        });

    });

}
