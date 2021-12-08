import { modifyUserProfilPicture } from "../functions/users/modifyUserProfilPicture.js";
import { profilPicturesPath } from "../index.js";

export const apiChangeProfilePicture = (req, res, next) => {

    const database = req.app.locals.database;

    const imageExtension = path.extname(req.file.originalname).toLowerCase();
    const imageName = userID + imageExtension;
    
    modifyUserProfilPicture(database, req, imageName, profilPicturesPath, imageExtension, req.file.path, (error) => {
        if(error) return res.redirect(errorHandler(error));
        return res.redirect("/account");
    });

}