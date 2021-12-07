/*
titre : logoutUser
role  : 1) on supprime le cookie de connexion
*/

// Imports
import { log } from '../technicals/technicals.js';

export const logoutUser = (req, callback) => {
    /*
        DEF  : On supprime le cookie de connexion
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        CALLBACK : true
    */
    req.session.destroy();
    log("User disconnected");
    callback();
}