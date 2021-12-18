/*
titre : sendMessage
role  : 1) vérifier la requête POST
        2) préparer les informations pour la db
        3) vérifier l'existance de la conversation
        4) ajouter le message à la db
*/

// Imports
import { createNotification } from '../notifications/createNotification.js';
import { deleteNotificationFromLastMessage } from '../notifications/deleteNotificationFromLastMessage.js';
import { encrypt } from '../technicals/encryption.js';
import { cutString, getConnectedUserID, isRequestPOST, log, toObjectID } from '../technicals/technicals.js';

const isSendMessageFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour envoyer un message sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
   return req.body.message !== undefined && req.body.message !== "" &&
          req.body.conversationID !== undefined
}

export const sendMessage = (database, req, callback) => {
    /*
        DEF  : On ajoute un nouveau message à la base de donnée et on callback false si il n'y a pas d'erreur, true si il y en a une
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : existance d'une erreur (false|true)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback(true);                   // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback(true);                      // est-ce que req.body est défini (POST)
    if(!isSendMessageFormDataValid(req)) return callback(true);         // est-ce que les données nécessaires pour créer un message sont dans la requête POST et utilisables

    const conversationID_toObjectID = toObjectID(req.body.conversationID);

    database.collection("conversations").findOne({ _id: conversationID_toObjectID }, function(err, conversation) {

        if(err) return callback(true);                         // Erreur reliée à mongoDB
        if(!conversation) return callback(true);               // Pas de conversation pour le conversationID fourni

        database.collection("messages").find({conversationID: conversationID_toObjectID}).toArray(function(errMessages, messages) {

            if(errMessages) return callback(true);             // Erreur reliée à mongoDB
            const actualNumID = messages.length;

            const newMessage = {
                "fromUserID"    : userID_toObjectID,
                "message"       : encrypt(cutString(req.body.message, 2000)),
                "createdOn"     : (new Date()).getTime(),
                "conversationID": conversationID_toObjectID,
                "numID"         : actualNumID + 1,
            };

            // Insertion du message dans la base de données
            database.collection("messages").insertOne(newMessage, (errInsertMessage, res) => {
                if (errInsertMessage || !res) return callback(true)                // Erreur reliée à mongoDB
                log("New message added, ID:"+res.insertedId);

                conversation.participants.forEach(participantID => {
                    if(participantID.toString() !== userID_toObjectID.toString()){
                        /* 
                        On crée la notification d'un nouveau message pour tout les 
                        participants de la conversation excepté celui qui envoie le message
                        */
                        createNotification(
                            database,
                            participantID,
                            "newMessage",
                            [
                                conversation._id,
                                userID_toObjectID,
                                cutString(req.body.message, 30)
                            ],
                            (newlyCreatedNotificationID) => {
                                /*
                                On supprime la dernière notification d'un nouveau message pour tout les participants 
                                de la conversation excepté celui qui envoie le message (une seule notification par conversation)
                                (on ne supprime pas la nouvelle notification crée !)
                                */
                                deleteNotificationFromLastMessage(
                                    database,
                                    conversation._id,
                                    participantID,
                                    newlyCreatedNotificationID
                                );
                            }
                        );
                    }
                });

                return callback(false)                                             // Aucune erreur
            });

        });
    }); 

}
