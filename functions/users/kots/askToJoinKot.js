/*
titre : askToJoinKot
role  : 1) Vérifie la requête POST
        2) Ajoute dans la db une nouvelle demande de rejoindre un kot 
*/

// Imports
import { isUserConnected } from '../../../protections/isUserConnected.js';
import { createNotification } from '../../notifications/createNotification.js';
import { isRequestPOST, log, toObjectID, getConnectedUserID, objectIDsArrayIncludes } from '../../technicals/technicals.js';

const isAskToJoinKotFormDataValid = (req) => {
    /*
        DEF  : Vérifie que les donées sont dans la requête POST et qu'elles sont utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.kotID!==undefined
}

export const askToJoinKot = (database, req, callback) => {
    /*
        DEF  : ajoute une demande de rejoinde le kot dans la db
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)| callback (Function(string)) 
        CALLBACK : Array<"OK"|"ERROR", any>
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(!isUserConnected(req)) return callback(["ERROR", "CONNECTION_NEEDED"]);          //
    if(userID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);               // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(["ERROR", "BAD_REQUEST"]);                  // est-ce que req.body est défini (POST)
    if(!isAskToJoinKotFormDataValid(req)) return callback(["ERROR", "BAD_REQUEST"]);    // 

    const kotID_toObjectID = toObjectID(req.body.kotID);
    if(kotID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);                // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("kots").findOne({ _id: kotID_toObjectID }, function(err, kot) {
        
        if(err) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
        if(!kot) return callback(["ERROR", "BAD_KOTID"]); // Pas de kot pour ce kotID
        objectIDsArrayIncludes(kot.collocationData.tenantsID, userID_toObjectID, (isConnectedUserInTenants) => {
            if(isConnectedUserInTenants) return callback(["ERROR", "ALREADY_IN_TENANTS"]);
      
            database.collection("askToJoin").findOne({ kotID: kotID_toObjectID, userID: userID_toObjectID }, function(err_askToJoin, askToJoin) {

                if(err_askToJoin) return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
                if(askToJoin) return callback(["ERROR", "ALREADY_ASKEDTOJOIN"]); // L'utilisateur a déja demandé de rejoindre ce kot
        
                const newAskToJoin = {
                    "createdOn"     : (new Date()).getTime(),
                    "userID"        : userID_toObjectID,
                    "kotID"         : kotID_toObjectID
                };
            
                // Insertion de la demande dans la base de données
                database.collection("askToJoin").insertOne(newAskToJoin, (err_askToJoin_insertion, res) => {
                    if (err_askToJoin_insertion || !res) return callback(["ERROR", "SERVICE_PROBLEM"])     // Erreur reliée à mongoDB
                    log("New askedToJoin added, ID:"+res.insertedId);

                    /* 
                    On crée la notification d'une nouvelle demande pour rejoindre le kot
                    pour le créateur du kot
                    */
                    createNotification(
                        database,
                        kot.creatorID,
                        "newAskToJoin",
                        [
                            kot._id,
                            userID_toObjectID,
                            kot.title
                        ],
                        (newlyCreatedNotificationID) => { /* PASS */ }
                    );

                    return callback(["OK", ""])                                  // Aucune erreur
                });

            });

        })
    });

}
