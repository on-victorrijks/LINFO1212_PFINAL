import fs from "fs";

import { getKot } from "../functions/kots/getKot.js";
import { modifyKot } from "../functions/kots/modifyKot.js";
import { kotsPicturesPath } from "../index.js";

export const apiModifyKot = (req, res, next) => {

    const database = req.app.locals.database;

    if(!(req && req.body)) return res.redirect("/?error=BAD_REQUEST");

    getKot(database, req, req.body.kotID, true, (kotData) => {

        if(kotData.creatorID.toString() !== userID) return res.redirect("/kot/profile/" + req.body.kotID + "?error=NOT_CREATOR");
        if(req.body.binNames===undefined) return res.redirect("/kot/modify/" + req.body.kotID + "?error=BAD_REQUEST");

        const binNames = req.body.binNames.split("|");

        let pictures = req.files;
        let filteredPicturesName = [];

        let mainPictureIndex = 0;
        let mainPictureName = req.body.mainPictureName ? req.body.mainPictureName : pictures[0].mainPictureName;

        // On ne garde que les images non supprimées
        for (let i = 0; i < kotData.pictures.length; i++) {
            const alreadyUploadedPicture = kotData.pictures[i];
            if(!binNames.includes(alreadyUploadedPicture)){
                filteredPicturesName.push(alreadyUploadedPicture);
                if(alreadyUploadedPicture===mainPictureName) mainPictureIndex = i;
            }
        }

        let numberOfKeptPictures = filteredPicturesName.length;

        // Vérifications des fichiers uploadés
        for (let i = 0; i < pictures.length; i++) {
            const picture = pictures[i];
            // Le fichier est trop gros (size > 8mb), ou il n'est pas dans un format accepté, ou c'est un doublon
            if(!["image/jpeg", "image/jpg", "image/png"].includes(picture.mimetype) || picture.size > 8000000 || filteredPicturesName.includes(picture.originalname)){
                pictures.splice(i, 1);
                i -= 1;
            } else {
                filteredPicturesName.push(picture.originalname);
                if(picture.originalname===mainPictureName) mainPictureIndex = i + numberOfKeptPictures;
            }
        }

        if(filteredPicturesName.length===0) return res.redirect("/kot/modify/" + req.body.kotID + "?error=PICTURE_NEEDED");

        modifyKot(database, req, req.body.kotID, binNames, kotsPicturesPath, kotData.collocationData.tenantsID, mainPictureIndex, filteredPicturesName, (result) => {
            if(Array.isArray(result)){

                pictures.forEach(picture => {
                    const tempPath = picture.path;
                    const imageExtension = path.extname(picture.originalname).toLowerCase();
                    const imageName = req.body.kotID + "_" + picture.originalname;
                    const targetPath = path.join(kotsPicturesPath, imageName);
            
                    if ([".png", ".jpeg", ".jpg"].includes(imageExtension)) {
                        fs.rename(tempPath, targetPath, () => {});
                    } else {
                        fs.unlink(tempPath, () => {});
                    }
                });

                return res.redirect("/kot/profile/" + req.body.kotID);

            } else {
                return res.redirect("/kot/profile/" + req.body.kotID + "?error=" + result.toString());
            }
        });

    });

}