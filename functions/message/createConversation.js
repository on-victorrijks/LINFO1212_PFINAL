/*
titre : createConversation
role  : 1) vérifier la requête POST
        2) préparer les informations pour la db
        3) ajouter la conversation à la db
*/

// Imports
import { generateRandomToken, isRequestPOST, log, toInt, toObjectID } from '../technicals/technicals.js';

const isCreateConversationFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour créer un utilisateur sont dans la requête POST et utilisables (moins de 50 participants)
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    const numberOfUsers = req.body.numberOfUsers;
    if(!numberOfUsers) return false;
    if(toInt(numberOfUsers, 1, 50, 51) > 50) return false; // + de 50 participants
    
    let userIndex = 0;
    while(userIndex < numberOfUsers){
        const userIDforThisIndex = req.body["userID"+userIndex];
        if(userIDforThisIndex===undefined) return false;
        userIndex++;
    }

    return true;
}

const getParticipantsObjectIDs = (req) => {
    /*
        DEF  : On retourne les ObjectIDs de tout les participants contenu dans la requête POST, si un des userID n'est pas correct on retourne le boolean false
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : Array<mongodb.ObjectID> | false 
    */
    const numberOfUsers = req.body.numberOfUsers;
    let participantsObjectIDs = [];

    let userIndex = 0;
    while(userIndex < numberOfUsers){
        const userIDforThisIndex = toObjectID(req.body["userID"+userIndex]);
        if(userIDforThisIndex==="") return false; // l'userID donné ne peut pas être transformé en mongodb.ObjectID
        participantsObjectIDs.push(userIDforThisIndex);
        userIndex++;
    }

    return participantsObjectIDs;
}

export const createConversation = (database, req, callback) => {
    /*
        DEF  : On crée une nouvelle conversation entre deux utilisateurs fournis avec les données dans la requête POST et on callback soit un array contenant l'_id de la conversation insérée, soit une erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : [_id de la conversation ajoutée]/code d'erreur (Array<string>|string)
    */

    if(!isRequestPOST(req)) return callback("BAD_REQUEST");                      // est-ce que req.body est défini (POST)
    if(!isCreateConversationFormDataValid(req)) return callback("BAD_REQUEST");  // est-ce que les données nécessaires pour créer une conversation sont dans la requête POST et utilisables

    const participantsObjectIDs = getParticipantsObjectIDs(req);
    if(participantsObjectIDs===false) return callback("BAD_REQUEST");            // un des userID fourni ne peut pas être transformé en mongodb.objectID
    participantsObjectIDs.sort();                                                // on ordonne les objectIDs

    database.collection("conversations").findOne({ participants: participantsObjectIDs }, function(err, conversation) {

        if(err) return callback("SERVICE_PROBLEM");                         // Erreur reliée à mongoDB
        if(conversation && !req.body.ignoreDuplicatedConversation) return callback("CONVESATION_ALREADY_EXISTING");   // Une conversation avec ces participants existe déja

        const newConversation = {
            "participants"  : participantsObjectIDs,
            "passwordToJoin": generateRandomToken(),
            "createdOn"     : (new Date()).getTime()
        };
    
        // Insertion de l'utilisateur dans la base de données
        database.collection("conversations").insertOne(newConversation, (err, res) => {
            if (err || !res) return callback("SERVICE_PROBLEM")     // Erreur reliée à mongoDB
            log("New conversation created, ID:"+res.insertedId);
            return callback([res.insertedId])                       // Aucune erreur
        });

    }); 

}
