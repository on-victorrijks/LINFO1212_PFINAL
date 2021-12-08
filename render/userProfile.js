import { errorHandler } from "../errorHandler/errorHandler.js";
import { getKotsPublishedByUser } from "../functions/kots/getKotsPublishedByUser.js";
import { getUser } from "../functions/users/getUser.js";
import { getUserFavouritesKots } from "../functions/users/kots/getUserFavouritesKots.js";

export const renderUserProfile = (req, res, next) => {
    const database = req.app.locals.database;
    const userID = req.params.userID;
    getUser(database, userID, false, 
    (requestedUser) => {

        if(requestedUser===null) return res.redirect(errorHandler("BAD_USERID"));
        if(requestedUser._id.toString()===getConnectedUserID(req)) return res.redirect(errorHandler("OWN_ACCOUNT"));

        req.pageConfiguration.profilUser = requestedUser;
        req.pageConfiguration.ownAccount = false;
        req.pageConfiguration.profilUser.isResident = (requestedUser && requestedUser.type==="resident");
        req.pageConfiguration.profilUser.isLandlord = (requestedUser && requestedUser.type==="landlord");

        req.pageConfiguration.page.title += requestedUser.firstname + " " + requestedUser.lastname;
        req.pageConfiguration.page.description.replace("$fistname", requestedUser.firstname);
        req.pageConfiguration.page.description.replace("$lastname", requestedUser.lastname);
        req.pageConfiguration.page.keywords.replace("$fistname", requestedUser.firstname);
        req.pageConfiguration.page.keywords.replace("$lastname", requestedUser.lastname);

        if(req.pageConfiguration.profilUser.isLandlord){
            // L'user demandé est un propriétaire
            getKotsPublishedByUser(database, userID,
            (publishedKots) => {
                req.pageConfiguration.kotsPublishedByUser = publishedKots;
                return res.render('user_profile.html', req.pageConfiguration);
            },
            (error) => { return res.redirect(errorHandler(error)) })
        } else {
            // L'user demandé est un résident
            getUserFavouritesKots(database, userID,
            (favsKots) => {
                req.pageConfiguration.favsKots = favsKots;
                return res.render('user_profile.html', req.pageConfiguration);
            },
            (error) => { return res.redirect(errorHandler(error)) })
        }
    },
    (error) => { return res.redirect(errorHandler(error)) });
}