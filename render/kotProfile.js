import { errorHandler } from "../errorHandler/errorHandler.js";
import { getConnectedUserID } from "../functions/technicals/technicals.js";
import { getUser } from "../functions/users/getUser.js";

export const renderKotProfile = (req, res, next) => {
    const database = req.app.locals.database;
    getUser(database, req.pageConfiguration.kot.creatorID, true, 
    (creatorData) => {
        req.pageConfiguration.isConnectedUserTheCreator = getConnectedUserID(req) && req.pageConfiguration.kot.creatorID.toString()===getConnectedUserID(req);
        req.pageConfiguration.creatorData = creatorData;

        res.render('kot_profile.html', req.pageConfiguration);
    },
    (error) => { res.redirect(errorHandler(error)) });
}