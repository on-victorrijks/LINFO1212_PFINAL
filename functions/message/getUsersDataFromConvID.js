/*
titre : getUsersDataFromConvID
role  : 1) vérifier la requête POST
        2) récupérer les informations des utilisateurs dans la conversation ayant _id égal au paramètre conversationID trouvable dans la requête POST
*/

// Imports
import { log, getConnectedUserID, isRequestPOST, objectIDsArrayIncludes, toObjectID } from '../technicals/technicals.js';
import { getUsers } from '../users/getUsers.js';

const isGetUsersFromConversationFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour récupérer les utilisateurs d'une conversation sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
   return req.body.conversationID !== undefined
}

export const getUsersDataFromConvID = (database, req, callback) => {
    /*
        DEF  : On récupère les informations des utilisateurs dans la conversation ayant _id égal au paramètre conversationID trouvable dans la requête POST, on callback le résultat
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : messages|erreur (Array<UserObject>|true)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback(['ERROR', 'REQUEST']);                           // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(['ERROR', 'REQUEST']);                              // est-ce que req.body est défini (POST)
    if(!isGetUsersFromConversationFormDataValid(req)) return callback(['ERROR', 'REQUEST']);    // est-ce que les données nécessaires pour récupérer les utilisateurs d'une conversation sont dans la requête POST et utilisables
    
    const conversationID_toObjectID = toObjectID(req.body.conversationID);
    if(conversationID_toObjectID==="") return callback(['ERROR', 'REQUEST']);                   // le conversationID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("conversations").findOne({ _id: conversationID_toObjectID }, function(err, conversation) {

        if(err) return callback(['ERROR', 'SERVER']);               // Erreur reliée à mongoDB
        if(!conversation) return callback(['ERROR', 'REQUEST']);    // Pas de conversation pour le conversationID fourni
        objectIDsArrayIncludes(conversation.participants, userID_toObjectID, (isConnectedUserInConversation) => {

            if(!isConnectedUserInConversation) return callback(['ERROR', 'REQUEST']);  // L'utilisateur connecté n'est pas dans la conversation séléctionnée

            getUsers(database, conversation.participants, userID_toObjectID, (usersData) => {
                log("Users fetched for convesation : " + conversationID_toObjectID.toString());
                return callback(['OK', usersData]);                 // Aucune erreur
            });

        });
    }); 

}
