/*
titre : createKot
role  : 1) vérifier la requête POST
        2) préparer les informations pour la db
        3) ajouter le kot à la db
        4) renvoyer l'_id du kot ajouté
*/

// Imports
import { getConnectedUserID, toObjectID, isRequestPOST, log, cutString, toFloat, toBoolean, toInt } from '../technicals/technicals.js';

// Constants
const ENTRY_TYPES = ["flat", "house"];
const ENTRY_PETFRIENDLY = ["false", "small", "big"];

const isCreateKotFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour créer un kot sont dans la requête POST et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return  req.body.title!==undefined && req.body.title!=="" &&
            req.body.description!==undefined && req.body.description!=="" &&
            req.body.localisation_address!==undefined && req.body.localisation_address!=="" &&
            req.body.localisation_lat!==undefined && req.body.localisation_lat!=="" &&
            req.body.isOpen!==undefined && req.body.isOpen!=="" &&
            req.body.availability!==undefined && req.body.availability!=="" &&
            req.body.isCollocation!==undefined && req.body.isCollocation!=="" &&
            req.body.maxTenant!==undefined && req.body.maxTenant!=="" &&
            req.body.basePrice!==undefined && req.body.basePrice!=="" &&
            req.body.chargePrice!==undefined && req.body.chargePrice!=="" &&
            req.body.bedrooms!==undefined && req.body.bedrooms!=="" &&
            req.body.bathrooms!==undefined && req.body.bathrooms!=="" &&
            req.body.toilets!==undefined && req.body.toilets!=="" &&
            req.body.type!==undefined && req.body.type!=="" &&
            req.body.surface!==undefined && req.body.surface!=="" &&
            req.body.floors!==undefined && req.body.floors!=="" &&
            req.body.constructionYear!==undefined && req.body.constructionYear!=="" &&
            req.body.parking!==undefined && req.body.parking!=="" &&
            req.body.furnished!==undefined && req.body.furnished!=="" &&
            req.body.petFriendly!==undefined && req.body.petFriendly!=="" &&
            req.body.garden!==undefined && req.body.garden!=="" &&
            req.body.terrace!==undefined && req.body.terrace!==""
}

export const createKot = (database, req, mainPictureIndex, filteredPicturesName, callback) => {
    /*
        DEF  : On enregiste un nouveau kot avec les données dans la requête POST et on callback soit un array contenant l'_id du kot inséré, soit une erreur
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | mainPictureIndex (number) | filteredPicturesName (Array<string>) | callback (Function(string))
        CALLBACK : [_id du kot ajouté]/code d'erreur (Array<string>|string)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback("BAD_REQUEST");                   // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestPOST(req)) return callback("BAD_REQUEST");                      // est-ce que req.body est défini (POST)
    if(!isCreateKotFormDataValid(req)) return callback("BAD_REQUEST");           // est-ce que les données nécessaires pour créer un kot sont dans la requête POST et utilisables

    const newKot = {
        "creatorID"         : userID_toObjectID,
        "title"             : cutString(req.body.title, 128),
        "createdOn"         : (new Date()).getTime(),
        "description"       : cutString(req.body.description, 2000),
        "location"          : {
            "address": cutString(req.body.localisation_address, 256),
            "lat": toFloat(req.body.localisation_lat, 50.66797103612341), // def=Latitude du centre de LLN
            "lng": toFloat(req.body.localisation_lng, 4.610840944225293)  // def=Longitude du centre de LLN
        },
        "pictures"          : filteredPicturesName,
        "mainPictureIndex"  : mainPictureIndex,
        "hasBeenModified"   : false,
        "isOpen"            : toBoolean(req.body.isOpen),
        "availability"      : (new Date(req.body.availability)).getTime(),
        "isCollocation"     : toBoolean(req.body.isCollocation),
        "collocationData"   : {
            "maxTenant": toInt(req.body.maxTenant, -1, 26),
            "tenantsID": []
        },
        "basePrice"         : toInt(req.body.basePrice, -1, 20001),
        "chargePrice"       : toInt(req.body.chargePrice, -1, 20001),
        "bedrooms"          : toInt(req.body.bedrooms, 0, 26),
        "bathrooms"         : toInt(req.body.bathrooms, -1, 26),
        "toilets"           : toInt(req.body.toilets, -1, 26),
        "type"              : ENTRY_TYPES.includes(req.body.type) ? req.body.type : ENTRY_TYPES[0],
        "surface"           : toFloat(req.body.surface),
        "floors"            : toInt(req.body.floors, 0, 26),
        "constructionYear"  : toInt(req.body.constructionYear, 1849, 2021),
        "parking"           : toInt(req.body.parking, -1, 26),
        "furnished"         : toBoolean(req.body.furnished),
        "petFriendly"       : ENTRY_PETFRIENDLY.includes(req.body.petFriendly) ? req.body.petFriendly : ENTRY_PETFRIENDLY[0],
        "garden"            : toBoolean(req.body.garden),
        "terrace"           : toBoolean(req.body.terrace)
    };

    // Insertion du kot dans la base de données
    database.collection("kots").insertOne(newKot, (err, res) => {
        if (err || !res) return callback("SERVICE_PROBLEM")     // Erreur reliée à mongoDB
        log("New kot created, ID:"+res.insertedId);
        return callback([res.insertedId])                       // Aucune erreur
    });


}