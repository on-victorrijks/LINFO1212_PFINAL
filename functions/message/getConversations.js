/*
titre : getConversations
role  : 1) callback toutes les conversations d'un utilisateur

Interfaces:
ConversationObject: {
    _id: mongodb.ObjectID,
    participants: Array<mongodb.ObjectID>,
    createdOn: number (date)
}
*/

// Imports
import { log, toObjectID, getConnectedUserID, objectIDsArrayIncludes } from '../technicals/technicals.js';
import { getUsers } from '../users/getUsers.js';

export const getConversations = (database, req, callback) => {
    /*
        DEF  : On récupère toutes les conversations de l'utilisateur connecté et on les callback, on callback aussi en cas d'erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : Array<ConversationObject>/code d'erreur (Array<string>|string)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback("BAD_REQUEST");  // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID

    database.collection("conversations").find({}).toArray(function(err, conversations) {

        if(err) return callback([]);                // Erreur reliée à mongoDB
        if(!conversations) return callback([]);     // Pas de conversations dans la db

        let connectedUsersConversations = [];
        conversations.forEach((conversation) => {
            objectIDsArrayIncludes(conversation.participants, userID_toObjectID, (result) => {
                if (result) connectedUsersConversations.push(conversation);
            });
        })
        if(connectedUsersConversations.length===0) return callback([]);  // Pas de conversations dans la db

        connectedUsersConversations.forEach((conversation, index) => {
            getUsers(database, conversation.participants, userID_toObjectID, (usersData) => {
                
                const isDuo = usersData.length==1;
                conversation.usersData = usersData.reduce((a, v) => ({ ...a, [v._id.toString()]: v}), {});
                conversation.participantsIDs = usersData.map((userData) => userData._id.toString());
                
                conversation.conv_lastmessage = "Salut mon pote =)"; 
                conversation.conv_image = [];
                conversation.conv_name = "";

                for (let userIndex = 0; (userIndex < usersData.length && userIndex < 4); userIndex++) {
                    const participant = usersData[index];
                    conversation.conv_image.push(participant._id.toString());
                    conversation.conv_name += ", " + usersData[0].firstname + " " + usersData[0].lastname;
                }

                conversation.conv_name = conversation.conv_name.substring(2);

                if((index + 1) === connectedUsersConversations.length) {
                    log("Conversations fetched for connected user, ID:"+userID_toObjectID.toString());
                    return callback(connectedUsersConversations); // Aucune erreur     
                }
            });
        });
 
    });

}
