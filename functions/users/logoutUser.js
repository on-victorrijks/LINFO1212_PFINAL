/*
titre : logoutUser
role  : 1) on supprime le cookie de connexion
        2) on redirige vers la page index avec le code de succès "DISCONNECTED"
*/

// Imports
import { log } from '../technicals/technicals.js';

export const logoutUser = (req, res, next) => {
    /*
        DEF  : On supprime le cookie de connexion et on redirige vers la page INDEX
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
    */
    req.session.destroy();
    log("User disconnected");
    res.redirect('/?success=DISCONNECTED');
}