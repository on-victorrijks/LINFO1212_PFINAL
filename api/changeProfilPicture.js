import { modifyUserProfilPicture } from "../functions/users/modifyUserProfilPicture.js";
import { profilPicturesPath } from "../index.js";
import path from "path";
import { getConnectedUserID } from "../functions/technicals/technicals.js";
import { errorHandler } from "../errorHandler/errorHandler.js";

export const apiChangeProfilePicture = (req, res, next) => {

    const database = req.app.locals.database;
    if(!req.file) return res.redirect(errorHandler("NO_PROFILPIC"));
    
    const imageExtension = path.extname(req.file.originalname).toLowerCase();
    const imageName = getConnectedUserID(req) + imageExtension;
    
    modifyUserProfilPicture(database, req, imageName, profilPicturesPath, imageExtension, req.file.path, (error) => {
        if(error) return res.redirect(errorHandler(error));
        return res.redirect("/account");
    });

}