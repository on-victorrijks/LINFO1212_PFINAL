/*
titre : getMessages
role  : 1) vérifier la requête POST
        2) récupérer les messages

Interfaces:
MessageObject: {
    _id: mongodb.ObjectID,
    fromUserID: mongodb.ObjectID,
    message: {
        iv: string,
        content: string
    },
    createdOn: number (date),
    conversationID: mongodb.ObjectID,
    numID: number
}
*/

// Imports
import { decrypt } from '../technicals/encryption.js';
import { getConnectedUserID, isRequestPOST, objectIDsArrayIncludes, toObjectID } from '../technicals/technicals.js';

// Constants
const limitMessages = 15;

const isGetMessagesFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour récupérer les messages sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
   return req.body.conversationID !== undefined &&
          req.body.lastNumID !== undefined
}

export const getMessages = (database, req, callback) => {
    /*
        DEF  : On récupère les messages pour les filtres présents dans la requête POST, on callback soit les messages soit true en cas d'erreur 
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : messages|erreur (Array<MessageObject>|true)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback(['ERROR', 'REQUEST']);           // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(['ERROR', 'REQUEST']);              // est-ce que req.body est défini (POST)
    if(!isGetMessagesFormDataValid(req)) return callback(['ERROR', 'REQUEST']); // est-ce que les données nécessaires pour récupérer les messages sont dans la requête POST et utilisables
    if(req.body.lastNumID <= 0) return callback(['ERROR', 'NOMSG']);            // plus de message
    
    const conversationID_toObjectID = toObjectID(req.body.conversationID);
    if(conversationID_toObjectID==="") return callback(['ERROR', 'REQUEST']);   // le conversationID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("conversations").findOne({ _id: conversationID_toObjectID }, function(err, conversation) {

        if(err) return callback(['ERROR', 'SERVER']);               // Erreur reliée à mongoDB
        if(!conversation) return callback(['ERROR', 'REQUEST']);    // Pas de conversation pour le conversationID fourni
        objectIDsArrayIncludes(conversation.participants, userID_toObjectID, (isConnectedUserInConversation) => {

            if(!isConnectedUserInConversation) return callback(['ERROR', 'REQUEST']);  // L'utilisateur connecté n'est pas dans la conversation séléctionnée

            database.collection("messages").find({conversationID: conversationID_toObjectID, numID: { $lt: req.body.lastNumID }}).limit(limitMessages).sort({ createdOn: -1 }).toArray(function(errMessages, messages) {
                if(errMessages) return callback(['ERROR', 'SERVER']);                  // Erreur reliée à mongoDB

                for (let index = 0; index < messages.length; index++) {
    
                    const message = messages[index];
                    message.message = decrypt(message.message);
                    message.isFromUser = message.fromUserID.toString()===userID_toObjectID.toString();
                    
                    if((index + 1) === messages.length){
                        return callback(['OK', messages]);                 // Aucune erreur
                    } 
                }
    
            });

        });
    }); 

}
