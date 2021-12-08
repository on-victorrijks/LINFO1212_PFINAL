import { errorHandler } from "../errorHandler/errorHandler.js";
import { isUserConnected } from "../protections/isUserConnected.js";

export const userConnected = function(req, res, next) {
    if( isUserConnected(req) ){
        next();
    } else {
        return res.redirect(errorHandler("CONNECTION_NEEDED"))
    }
}