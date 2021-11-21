/*
titre : deleteKot
role  : 1) vérifier la requête POST
        2) Suprrimer le kot de la Db
*/

// Imports
import { getConnectedUserID, toObjectID, isRequestPOST, log, cutString, toFloat, toBoolean, toInt } from '../technicals/technicals.js';

const isDeleteKotFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour supprimer un kot sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req &&
            req.session &&
            req.session.creatorId &&
            req.query.kotId!==undefined &&
            req.query.kotId !== ""
}

export const deleteKot = (database, req, callback) => {
    /*
        DEF  : On supprime un kot en fonction de la requête GET
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : existance d'une erreur/code d'erreur (False|string)
    */

    if(req.query===undefined) return callback("BAD_REQUEST");               // est-ce que req.query est défini (GET)
    if(!isDeleteKotFormDataValid(req)) return callback("BAD_REQUEST");    // est-ce que les données nécessaires pour supprimer un kot sont dans la requête GET et utilisables

    const kotId = req.query.kotId;

    // is there an kot existing with this id and is the connected user the owner ?
    database.collection("kots").deleteOne({ _id: toObjectID(kotId), creatorID: req.session.userID }, function(err, kot) {
        if (err || !kot) return callback("SERVICE_PROBLEM"); // en cas d'erreur lors de la suppression ou du manque du kot correspondant à kotId on callback une erreur
        return callback(false); // si il n'y a pas eu d'erreur on callback false (erreur nulle)
    });
}