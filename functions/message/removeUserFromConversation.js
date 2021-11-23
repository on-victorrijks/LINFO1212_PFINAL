/*
titre : removeUserFromConversation
role  : 1) vérifier la requête POST
        2) supprimer l'userID trouvable dans la requête POST de la conversation avec l'_id égal au conversationID trouvable dans la requête POST
*/

// Imports
import { getConnectedUserID, isRequestPOST, log, toObjectID, objectIDsArrayIncludes } from '../technicals/technicals.js';

const isRemoveUserFromConversationFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour enlever un utilisateur d'une conversation sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return req.body.conversationID && req.body.userToRemoveID
}

export const removeUserFromConversation = (database, req, callback) => {
    /*
        DEF  : On rajoute l'utilisateur à la conversation avec l'_id étant égal au paramètre conversationID, en cas d'erreur on callback l'erreur, sinon on callback true
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : false/code d'erreur (false|string)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback("BAD_REQUEST");                      // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback("BAD_REQUEST");                         // est-ce que req.body est défini (POST)
    if(!isRemoveUserFromConversationFormDataValid(req)) return callback("BAD_REQUEST");       // est-ce que les données nécessaires pour supprimer un utilisateur sont dans la requête POST et utilisables

    const conversationID_toObjectID = toObjectID(req.body.conversationID);
    if(conversationID_toObjectID==="") return callback("BAD_REQUEST");              // conversationID ne peut pas être transformé en mongodb.ObjectID

    const userToRemoveID_toObjectID = toObjectID(req.body.userToRemoveID);
    if(userToRemoveID_toObjectID==="") return callback("BAD_REQUEST");              // userToRemoveID ne peut pas être transformé en mongodb.ObjectID

    database.collection("conversations").findOne({ _id: conversationID_toObjectID }, function(err, conversation) {

        if(err) return callback("SERVICE_PROBLEM");                                 // Erreur reliée à mongoDB
        if(!conversation) return callback("BAD_REQUEST");                           // Il n'y a pas de conversation pour ce conversationID

        objectIDsArrayIncludes(conversation.participants, userID_toObjectID, (isConnectedUserInConversation) => {
            if(!isConnectedUserInConversation) return callback("BAD_REQUEST");      // L'utilisateur connecté n'est pas dans la conversation

            let indexOfParticipantToDelete = -1;
            for (let index = 0; index < conversation.participants.length; index++) {
                const participant = conversation.participants[index];
                if(participant.toString() === userToRemoveID_toObjectID.toString()){
                    indexOfParticipantToDelete = index;
                    break;
                }
            }
            if(indexOfParticipantToDelete === -1) return callback("BAD_REQUEST");       // L'userToRemoveID n'est pas dans les participants
            
            conversation.participants.splice(indexOfParticipantToDelete, 1);
    
            const modifiedConversation = {
                $set: {
                    participants: conversation.participants
                }
            } 
    
            database.collection("conversations").updateOne({ _id: conversation._id }, modifiedConversation, function(err, res) {
                if(err) return callback("SERVICE_PROBLEM");     // Erreur reliée à mongoDB
                log("User removed from conversation, CONV_ID:" + res.insertedId);
                return callback(false);                         // Aucune erreur
            });

        });

    }); 

}
