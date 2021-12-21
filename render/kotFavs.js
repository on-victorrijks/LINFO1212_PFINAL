import { errorHandler } from "../errorHandler/errorHandler.js";
import { getConnectedUserID } from "../functions/technicals/technicals.js";
import { getUserFavouritesKots } from "../functions/users/kots/getUserFavouritesKots.js";

export const renderKotFavs = (req, res, next) => {
    const database = req.app.locals.database;
    getUserFavouritesKots(database, getConnectedUserID(req), false,
    (favsKots) => {
        req.pageConfiguration.favsKots = favsKots;
        req.pageConfiguration.hasFavsKots = favsKots.length>0;
        res.render('kots_favs.html', req.pageConfiguration);
    },
    (error) => { res.redirect(errorHandler(error)) })
}