import { errorHandler } from "../errorHandler/errorHandler.js";
import { getConnectedUserID } from "../functions/technicals/technicals.js";
import { getUser } from "../functions/users/getUser.js";
import { isKotInFavouritesOfConnectedUser } from "../functions/users/kots/isKotInFavouritesOfConnectedUser.js";
import { hasUserAskedToJoinThisKot } from "../functions/users/kots/hasUserAskedToJoinThisKot.js";

export const renderKotProfile = (req, res, next) => {
    const database = req.app.locals.database;
    const kotID = req.pageConfiguration.kot._id;
    getUser(database, req.pageConfiguration.kot.creatorID, true, 
    (creatorData) => {
        isKotInFavouritesOfConnectedUser(database, req, kotID, 
        (isInConnectedUserFavs) => {
            hasUserAskedToJoinThisKot(database, req, kotID, 
            (hasUserAskedToJoinThisKot) => {

                req.pageConfiguration.isConnectedUserTheCreator = getConnectedUserID(req) && req.pageConfiguration.kot.creatorID.toString()===getConnectedUserID(req);
                req.pageConfiguration.creatorData = creatorData;

                // favs & colocation preloader
                req.pageConfiguration.isKotInFavs               = ![null, undefined].includes(isInConnectedUserFavs);
                req.pageConfiguration.isKotInAskToJoin          = ![null, undefined].includes(hasUserAskedToJoinThisKot);   // We could avoid that by refactoring the 
                req.pageConfiguration.isKotInAskToJoinOpposite  = !req.pageConfiguration.isKotInAskToJoin;                  // html of kot_profile.html a little

                res.render('kot_profile.html', req.pageConfiguration);
            });
        });
    },
    (error) => { res.redirect(errorHandler(error)) });
}