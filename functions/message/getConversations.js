/*
titre : getConversations
role  : 1) callback toutes les conversations d'un utilisateur

Interfaces:
ConversationObject: {
    _id: mongodb.ObjectID,
    participants: Array<mongodb.ObjectID>,
    passwordToJoin: string,
    createdOn: number (date)
}
*/

// Imports
import { log, toObjectID, getConnectedUserID, objectIDsArrayIncludes, cutString } from '../technicals/technicals.js';
import { getUsers } from '../users/getUsers.js';
import { getLastMessage } from './getLastMessage.js';

export const getConversations = (database, req, success, error) => {
    /*
        DEF  : On récupère toutes les conversations de l'utilisateur connecté et on les callback, on callback aussi en cas d'erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : Array<ConversationObject>/code d'erreur (Array<string>|string)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return error("BAD_REQUEST");  // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID

    database.collection("conversations").find({}).toArray(function(err, conversations) {

        if(err) return error("SERVICE_ERROR");                // Erreur reliée à mongoDB
        if(!conversations) return success([]);       // Pas de conversations dans la db

        let connectedUsersConversations = [];
        conversations.forEach((conversation) => {
            objectIDsArrayIncludes(conversation.participants, userID_toObjectID, (result) => {
                if (result) connectedUsersConversations.push(conversation);
            });
        })
        if(connectedUsersConversations.length===0) return success([]);  // Pas de conversations dans la db pour l'utilisateur connecté

        connectedUsersConversations.forEach((conversation, index) => {

            getUsers(database, conversation.participants, userID_toObjectID, (usersData) => {
            
                conversation.usersData = usersData.reduce((a, v) => ({ ...a, [v._id.toString()]: v}), {});
                conversation.participantsIDs = usersData.map((userData) => userData._id.toString());
                
                getLastMessage(database, req, conversation._id.toString(), ([status, content]) => {
                    

                    if(status==="ERROR") {
                        conversation.conv_lastmessage = "Pas de message"; 
                        conversation.isLastMessageFromUser = false; 
                    } else {
                        if(content.message.length > 23){
                            conversation.conv_lastmessage = cutString(content.message, 23) + "...";
                        } else {
                            conversation.conv_lastmessage = content.message;
                        }
                        conversation.isLastMessageFromUser = content.isFromUser; 
                    }
                    conversation.conv_image = [];
                    conversation.conv_name = "";
    
                    if(usersData.length===0){
                        conversation.conv_image.push("$ONLYCONNECTEDUSER");
                        conversation.conv_name = "Seulement vous";
                    } else {
                        for (let userIndex = 0; (userIndex < usersData.length && userIndex < 4); userIndex++) {
                            const participant = usersData[userIndex];
                            if(participant){
                                conversation.conv_image.push(participant._id.toString());
                                conversation.conv_name += ", " + participant.firstname + " " + participant.lastname;
                            }
                        }
                        conversation.conv_name = conversation.conv_name.substring(2);
                    }
    
    
                    if((index + 1) === connectedUsersConversations.length) {
                        log("Conversations fetched for connected user, ID:"+userID_toObjectID.toString());
                        return success(connectedUsersConversations); // Aucune erreur     
                    }

                })
                
            });
        });
 
    });

}
