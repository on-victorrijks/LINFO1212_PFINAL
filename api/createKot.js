import fs from "fs";
import path from "path";

import { createKot } from "../functions/kots/createKot.js";
import { kotsPicturesPath } from "../index.js";

export const apiCreateKot = (req, res, next) => {

    const database = req.app.locals.database;

    if(!(req && req.body)) return res.redirect("/kot/create/?error=BAD_REQUEST");

    let pictures = req.files;
    let filteredPicturesName = [];

    let mainPictureIndex = 0;
    let mainPictureName = req.body.mainPictureName ? req.body.mainPictureName : pictures[0].mainPictureName;

    // Vérifications des fichiers uploadés
    for (let i = 0; i < pictures.length; i++) {
        const picture = pictures[i];
        // Le fichier est trop gros (size > 8mb), ou il n'est pas dans un format accepté, ou c'est un doublon
        if(!["image/jpeg", "image/jpg", "image/png"].includes(picture.mimetype) || picture.size > 8000000 || filteredPicturesName.includes(picture.originalname)){
            pictures.splice(i, 1);
            i -= 1;
        } else {
            filteredPicturesName.push(picture.originalname);
            if(picture.originalname===mainPictureName) mainPictureIndex = i;
        }
    }

    if(pictures.length===0) return res.redirect("/kot/create/?error=PICTURE_NEEDED");

    createKot(database, req, mainPictureIndex, filteredPicturesName, ([status, content]) => {
        if(status==="OK"){
            const newKotID = content;

            pictures.forEach(picture => {
                const tempPath = picture.path;
                const imageExtension = path.extname(picture.originalname).toLowerCase();
                const imageName = newKotID + "_" + picture.originalname;
                const targetPath = path.join(kotsPicturesPath, imageName);
        
                if ([".png", ".jpeg", ".jpg"].includes(imageExtension)) {
                    fs.rename(tempPath, targetPath, () => {});
                } else {
                    fs.unlink(tempPath, () => {});
                }
            });

            return res.redirect("/kot/profile/"+newKotID.toString());

        } else {
            const error = content;
            return res.redirect("/kot/create/?error=" + error);
        }
    });

}