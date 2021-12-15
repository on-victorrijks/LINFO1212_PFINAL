/*
titre : addUserToConversation
role  : 1) ajout d'un userID à la conversation avec l'_id convID
*/

// Imports
import { errorHandler } from '../../errorHandler/errorHandler.js';
import { log } from '../technicals/technicals.js';

export const addUserToConversation = (database, convID, userID) => {
    /*
        DEF  : On rajoute l'utilisateur à la conversation avec l'_id étant égal au paramètre convID
        PRE  : database (mongodb.Db) | convID (mongodb.ObjectID) | userID (mongodb.ObjectID)
    */

    database.collection("conversations").findOne({ _id: convID }, function(err, conversation) {

        if(err) return errorHandler("SERVICE_PROBLEM");                     // Erreur reliée à mongoDB
        if(!conversation) return;                                           // Pas de conversation pour ce convID

        const modifiedParticipants = conversation.participants;
        modifiedParticipants.push(userID);
        modifiedParticipants.sort();  

        const modifiedConversation = {
            $set: {
                participants: modifiedParticipants
            }
        } 

        database.collection("conversations").updateOne({ _id: conversation._id }, modifiedConversation, function(err, res) {
            if(err) return errorHandler("SERVICE_PROBLEM");     // Erreur reliée à mongoDB
            log("Connected user added to conversation, CONV_ID:" + res.insertedId);
            return;                         // Aucune erreur
        });

    }); 

}
