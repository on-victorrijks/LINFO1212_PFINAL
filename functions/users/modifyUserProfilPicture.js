/*
titre : modifyUserProfilPicture
role  : 1) modifier le champ profilPicture pour l'utilisateur connecté
        2) supprimer l'ancienne image de l'utilisateur connecté
*/

// Imports
import path from "path";
import fs from "fs";
import { getConnectedUserID, log, toObjectID } from '../technicals/technicals.js';

export const modifyUserProfilPicture = (database, req, imageName, profilPicturesPath, imageExtension, tempPath, callback) => {
    /*
        DEF  : On modifie le champ profilPicture pour l'utilisateur connecté et on supprime l'ancienne image de l'utilisateur connecté
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | imageName (string) | profilPicturesPath (string) | imageExtension (string) | tempPath (string) | callback (Function(False|string))
        CALLBACK : existance d'une erreur/code d'erreur (False|string)
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));
    if(userID_toObjectID==="") return callback("BAD_REQUEST");  // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    

    if(![".png", ".jpeg", ".jpg"].includes(imageExtension)) {
        fs.unlink(tempPath, (err) => {
            return callback("BAD_FORMAT");
        });
    } else {
        database.collection("users").findOne({ _id: userID_toObjectID }, function(err, user) {

            if(err) return callback("SERVICE_PROBLEM"); // Erreur reliée à mongoDB
            if(!user) return callback("BAD_USERID");
    
            // On upload la nouvelle image
            const targetPath = path.join(profilPicturesPath, imageName);
            fs.rename(tempPath, targetPath, (err) => {
                if(err) return callback(err);
    
                const modifiedUser = {
                    $set: {
                        profilPicture: imageName
                    }
                } 
        
                const oldImagePath = user.profilPicture==="$DEFAULT" ? false : path.join(profilPicturesPath, user.profilPicture);
                const newImagePath = path.join(profilPicturesPath, imageName);
        
                database.collection("users").updateOne({ _id: userID_toObjectID }, modifiedUser, function(err, res) {
                    if(err) return callback("BAD_REQUEST");     // Erreur reliée à mongoDB
        
                    if(oldImagePath && oldImagePath !== newImagePath){
                        // On supprime l'ancienne image de l'utilisateur
                        fs.unlink(oldImagePath, (errUnlink) => {
                            if(errUnlink) return callback("BAD_REQUEST");     // Erreur reliée à la suppression de l'ancienne image
                            log("User's profil picture modified and old profil picture deleted, ID:" + res.insertedId);
                            return callback(false);                           // Aucune erreur
                        });
                    } else {
                        log("User's profil picture modified, ID:" + res.insertedId);
                        return callback(false);  // Aucune erreur   
                    }
        
                });
    
            });
    
        }); 

    }

}
