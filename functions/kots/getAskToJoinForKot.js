/*
titre : getAskToJoinUsersForKot
role  : 1) Vérifie la requête POST
        2) Renvoie les données liées aux personnes demandant de rejoindre le kot
*/

// Imports
import { getConnectedUserID, isRequestPOST, log, toObjectID } from '../technicals/technicals.js';
import { getUsers } from '../users/getUsers.js';

const isGetAskToJoinUsersForKotFormDataValid = (req) => {
    /*
        DEF  : vérifie si les données sont dans la requête POST et valide pour renvoyer les donées des utilisateurs voulant rejoindre le kot
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.kotID!==undefined
}

export const getAskToJoinUsersForKot = (database, req, callback) => {
    /*
        DEF  : renvoie les données des utilisateurs voulant rejoindre le kot ou un erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : Array<"OK"|"ERROR", any>
    */


    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback(['ERROR', 'CONNECTION_NEEDED']);           // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID

    if(!isRequestPOST(req)) return callback(['ERROR', 'REQUEST']);                        // est-ce que req.body est défini (POST)
    if(!isGetAskToJoinUsersForKotFormDataValid(req)) return callback(['ERROR', 'REQUEST']);    // est-ce que les données nécessaires pour récupérer les données des utilisateurs qui demande à rejoindre une colocation sont disponibles et utilisables

    const kotID_toObjectID = toObjectID(req.body.kotID);
    if(kotID_toObjectID==="") return callback(['ERROR', 'REQUEST']); // le kotID fourni ne peut pas être transformé en mongodb.ObjectID

    database.collection("askToJoin").find({ kotID: kotID_toObjectID }).toArray(function(err, askToJoin_requests) {
        if(err) return callback(['ERROR', 'SERVICE_ERROR']);

        const askToJoin_requests_usersIDs = askToJoin_requests.map(askToJoin => askToJoin.userID);

        getUsers(database, askToJoin_requests_usersIDs, "", (usersData) => {

            log("AskToJoin for kot fetched, ID:"+kotID_toObjectID.toString());

            callback(['OK', usersData]);

        })

    });

}
