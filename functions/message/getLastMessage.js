/*
titre : getLastMessage
role  : 1) vérifier la requête POST
        2) récupérer le dernier message d'une conversation avec conversationID comme _id

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
import { getConnectedUserID, objectIDsArrayIncludes, toObjectID } from '../technicals/technicals.js';

export const getLastMessage = (database, req, conversationID, callback) => {
    /*
        DEF  : On récupère le dernier message d'une conversation avec le paramètre conversationID comme _id, on callback soit le dernier message en cas de réussite, soit true en cas d'erreur
        PRE  : database (mongodb.Db) | conversationID (string) | callback (Function(MessageObject|true))
        CALLBACK : message (MessageObject) | erreur (true)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));
    const conversationID_toObjectID = toObjectID(conversationID);

    if(userID_toObjectID==="") return callback(['ERROR', 'REQUEST']);           // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(conversationID_toObjectID==="") return callback(['ERROR', 'REQUEST']);   // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID


    database.collection("conversations").findOne({ _id: conversationID_toObjectID }, function(err, conversation) {

        if(err) return callback(['ERROR', 'SERVER']);               // Erreur reliée à mongoDB
        if(!conversation) return callback(['ERROR', 'REQUEST']);    // Pas de conversation pour le conversationID fourni
        objectIDsArrayIncludes(conversation.participants, userID_toObjectID, (isConnectedUserInConversation) => {

            if(!isConnectedUserInConversation) return callback(['ERROR', 'REQUEST']);   // L'utilisateur connecté n'est pas dans la conversation séléctionnée

            database.collection("messages").find({conversationID: conversationID_toObjectID}).limit(1).sort({ createdOn: -1 }).toArray(function(errMessage, lastMessageContainer) {
                if(errMessage) return callback(['ERROR', 'SERVER']);                        // Erreur reliée à mongoDB
                if(!lastMessageContainer) return callback(['ERROR', 'REQUEST']);            // Format incorrect
                if(lastMessageContainer.length===0) return callback(['ERROR', 'REQUEST']);  // Pas message

                const lastMessage = lastMessageContainer[0];

                lastMessage.message = decrypt(lastMessage.message);
                lastMessage.isFromUser = lastMessage.fromUserID.toString()===userID_toObjectID.toString();

                return callback(['OK', lastMessage]);                                   // Aucune erreur
            });

        });
    }); 

}
