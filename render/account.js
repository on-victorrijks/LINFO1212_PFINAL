import { errorHandler } from "../errorHandler/errorHandler.js";
import { getKotsPublishedByUser } from "../functions/kots/getKotsPublishedByUser.js";
import { getConnectedUserID } from "../functions/technicals/technicals.js";
import { getUserFavouritesKots } from "../functions/users/kots/getUserFavouritesKots.js";

export const renderAccount = (req, res, next) => {
    const database = req.app.locals.database;
    const connectedUser = req.pageConfiguration.user;

    req.pageConfiguration.profilUser = connectedUser;
    req.pageConfiguration.ownAccount = true;
    req.pageConfiguration.profilUser.isResident = (connectedUser && connectedUser.type==="resident");
    req.pageConfiguration.profilUser.isLandlord = (connectedUser && connectedUser.type==="landlord");

    req.pageConfiguration.page.title += connectedUser.firstname + " " + connectedUser.lastname;
    req.pageConfiguration.page.description.replace("$fistname", connectedUser.firstname);
    req.pageConfiguration.page.description.replace("$lastname", connectedUser.lastname);
    req.pageConfiguration.page.keywords.replace("$fistname", connectedUser.firstname);
    req.pageConfiguration.page.keywords.replace("$lastname", connectedUser.lastname);

    if(req.pageConfiguration.profilUser.isLandlord){
        // L'user demandé est un propriétaire
        getKotsPublishedByUser(database, getConnectedUserID(req),
        (publishedKots) => {
            req.pageConfiguration.kotsPublishedByUser = publishedKots;
            return res.render('user_profile.html', req.pageConfiguration);
        },
        (error) => { return res.redirect(errorHandler(error)) })
    } else {
        // L'user demandé est un résident
        getUserFavouritesKots(database, getConnectedUserID(req),
        (favsKots) => {
            req.pageConfiguration.favsKots = favsKots;
            return res.render('user_profile.html', req.pageConfiguration);
        },
        (error) => { return res.redirect(errorHandler(error)) })
    }
}