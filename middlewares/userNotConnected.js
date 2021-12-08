import { errorHandler } from "../errorHandler/errorHandler.js";
import { isUserConnected } from "../protections/isUserConnected.js";

export const userNotConnected = function(req, res, next) {
    if( isUserConnected(req) ){
        return res.redirect(errorHandler("ALREADY_CONNECTED"))
    } else {
        next();
    }
}