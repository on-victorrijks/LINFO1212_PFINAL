/*
titre : joinConversation
role  : 1) vérifier la requête POST
        2) préparer les informations pour la db
        3) vérifier le mot de passe pour rejoindre la conversation
        4) ajouter un participant à la conversation avec l'_id étant égal au paramètre convID
*/

// Imports
import { getConnectedUserID, isRequestPOST, log, toObjectID } from '../technicals/technicals.js';


const isJoinConversationFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour rejoidre une conversation sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return req.body.convID && req.body.password
}

export const joinConversation = (database, req, callback) => {
    /*
        DEF  : On rajoute l'utilisateur à la conversation avec l'_id étant égal au paramètre convID, en cas d'erreur on callback l'erreur, sinon on callback true
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : false/code d'erreur (false|string)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback("BAD_REQUEST");                      // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback("BAD_REQUEST");                         // est-ce que req.body est défini (POST)
    if(!isJoinConversationFormDataValid(req)) return callback("BAD_REQUEST");       // est-ce que les données nécessaires pour créer une conversation sont dans la requête POST et utilisables

    const convID_toObjectID = toObjectID(req.body.convID);
    if(convID_toObjectID==="") return callback(true);                               // convID ne peut pas être transformé en mongodb.ObjectID

    database.collection("conversations").findOne({ _id: convID_toObjectID }, function(err, conversation) {

        if(err) return callback("SERVICE_PROBLEM");                         // Erreur reliée à mongoDB
        if(!conversation) return callback("BAD_INVITATION");                // Pas de conversation pour ce convID
        if(req.body.password !== conversation.passwordToJoin) return callback("WRONG_PASSWORD");

        const modifiedParticipants = conversation.participants;
        modifiedParticipants.push(userID_toObjectID);
        modifiedParticipants.sort();  

        const modifiedConversation = {
            $set: {
                participants: modifiedParticipants
            }
        } 

        database.collection("conversations").updateOne({ _id: conversation._id }, modifiedConversation, function(err, res) {
            if(err) return callback("SERVICE_PROBLEM");     // Erreur reliée à mongoDB
            log("Connected user added to conversation, CONV_ID:" + res.insertedId);
            return callback(false);                         // Aucune erreur
        });

    }); 

}
