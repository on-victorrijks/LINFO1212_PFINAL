import path from "path";
import url from 'url';

import { profilPicturesPath } from "../index.js";
import { getUser } from "../functions/users/getUser.js";
import { errorHandler } from "../errorHandler/errorHandler.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const defaultProfilPicture = path.join(__dirname, "../static/imgs/user.png");

export const dispatchUserProfilePicture = (req, res) => {

    const database = req.app.locals.database;

    getUser(database, req.params.userID, false, 
    (requestedUser) => {
        if(requestedUser && requestedUser.profilPicture !== "$DEFAULT"){
            return res.sendFile(path.join(profilPicturesPath, requestedUser.profilPicture));
        } else {
            // No user for that userID, or the user with that userID doesn't have a profil picture set
            return res.sendFile(defaultProfilPicture);
        }
    },
    (error) => { 
        errorHandler(error);
        return res.sendFile(defaultProfilPicture);
    });
}