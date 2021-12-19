/*
titre : getConversation
role  : 1) callback la conversation avec l'_id étant égal au paramètre convID

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

export const getConversation = (database, req, convID, success, error) => {
    /*
        DEF  : On callback la conversation avec l'_id étant égal au paramètre convID, en cas d'erreur on callback l'erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | convID (mongodb.ObjectID sous le format string) | callback (Function(False|string))
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));
    const convID_toObjectID = toObjectID(convID);

    if(userID_toObjectID==="") return error("BAD_REQUEST");  // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(convID_toObjectID==="") return error("BAD_REQUEST");  // la convID fournie ne peut pas être transformé en mongodb.ObjectID

    database.collection("conversations").findOne({ _id: convID_toObjectID }, function(err, conversation) {

        if(err) return error("SERVICE_ERROR");               // Erreur reliée à mongoDB
        if(!conversation) return error("BAD_REQUEST");       // Pas de conversation pour ce convID dans la db

        objectIDsArrayIncludes(conversation.participants, userID_toObjectID, (isConnectedUserInConversation) => {
            if(isConnectedUserInConversation) return error("ALREADY_IN_CONVERSATION");       // L'utilisateur connecté est déja dans cette conversation

            getUsers(database, conversation.participants, "", (usersData) => {
            
                conversation.usersData = usersData.reduce((a, v) => ({ ...a, [v._id.toString()]: v}), {});
                conversation.conv_image = [];
                conversation.conv_name = "";
    
                for (let userIndex = 0; (userIndex < usersData.length && userIndex < 4); userIndex++) {
                    const participant = usersData[userIndex];
                    if(participant){
                        conversation.conv_image.push(participant._id.toString());
                        conversation.conv_name += ", " + participant.firstname + " " + participant.lastname;
                    }
                }
    
                conversation.conv_name = cutString(conversation.conv_name.substring(2), 75);
    
                log("Conversation fetched, ID:"+convID.toString());
                return success(conversation); // Aucune erreur     

            });

        });
 
    });

}
