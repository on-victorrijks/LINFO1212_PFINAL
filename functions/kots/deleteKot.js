/*
titre : deleteKot
role  : 1) supprimer les images liées à ce kot
        2) on kick les colocataires de la colocation
        3) modifier les données du kot 
*/

// Imports
import { kotsPicturesPath } from '../../index.js';
import { getConnectedUserID, log, toObjectID } from '../technicals/technicals.js';
import { removeTenant } from './removeTenant.js';
import fs from "fs";
import path from "path";

export const deleteKot = (database, req, kotID, callback) => {
    /*
        DEF  : On supprime le kot avec l'_id kotID
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | kotID (string) | callback (Function(False|string))
        CALLBACK : Array<"OK"|"ERROR", any>
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));
    const kotID_toObjectID = toObjectID(kotID);

    if(kotID_toObjectID==="") return callback(["ERROR", "BAD_REQUEST"]);

    // is there an kot existing with this kotID and is the connected user the owner ?
    database.collection("kots").findOne({ _id: kotID_toObjectID, creatorID: userID_toObjectID }, function(err, kot) {

        if(err) return callback(["ERROR", "SERVICE_ERROR"]);      // Erreur reliée à mongoDB
        if(!kot) return callback(["ERROR", "BAD_KOTID"]);         // Pas de kot pour ce kotID et ce creatorID
        
        const placeholderDeleted = "deleted#"+kot._id.toString();

        const modifiedKot = {
            $set: {
                "title"             : placeholderDeleted,
                "description"       : placeholderDeleted,
                "pictures"          : [],
                "mainPictureIndex"  : 0,
                "hasBeenModified"   : true,
                "isOpen"            : false,
                "hiddenInSearch"    : true
            }
        } 
    
    
        // On supprime les images qui ne sont pas gardées
        kot.pictures.forEach(toDeletePicture => {
            if(toDeletePicture!==""){
                const toDeletePicturePath = path.join(kotsPicturesPath, kot._id.toString() + "_" + toDeletePicture);
                fs.unlink(toDeletePicturePath, (errUnlink) => {
                    if(errUnlink) return callback(["ERROR", "BAD_REQUEST"]);     // Erreur reliée à la suppression de l'ancienne image
                    log("Kot's picture deleted, ID: " + toDeletePicturePath.toString());
                }); 
            }
        });

        kot.collocationData.tenantsID.forEach(tenantID => {
            removeTenant(database, {
                ...req, // pour garder le cookie de connexion
                body : {
                    kotID: kot._id.toString(),
                    userID_toRemove: tenantID.toString()
                } 
            }, ([status, content]) => {
                if(status==="ERROR" && content==="SERVICE_PROBLEM"){
                    return callback(["ERROR", "SERVICE_PROBLEM"]); // Erreur reliée à mongoDB
                }
            })
        });

        // Modification du kot dans la base de données
        database.collection("kots").updateOne({ _id: kotID_toObjectID, creatorID: userID_toObjectID }, modifiedKot, function(err_modify_kot, res) {
            if(err_modify_kot) return callback(["ERROR", "SERVICE_PROBLEM"]);     // Erreur reliée à mongoDB
            return callback(["OK", ""]) // Aucune erreur
        });


    });

}