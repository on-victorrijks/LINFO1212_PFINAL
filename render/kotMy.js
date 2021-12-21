import { errorHandler } from "../errorHandler/errorHandler.js";
import { getKotsPublishedByUser } from "../functions/kots/getKotsPublishedByUser.js";
import { getConnectedUserID } from "../functions/technicals/technicals.js";

export const renderKotMy = (req, res, next) => {
    const database = req.app.locals.database;
    getKotsPublishedByUser(database, getConnectedUserID(req), false,
    (ownKots) => {
        req.pageConfiguration.ownKots = ownKots;
        res.render('mykots.html', req.pageConfiguration);
    },
    (error) => { res.redirect(errorHandler(error)) })
}