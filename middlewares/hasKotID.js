import { errorHandler } from "../errorHandler/errorHandler.js";
import { isRequestWithKotID } from "../protections/isRequestWithKotID.js";

export const hasKotID = function(req, res, next) {
    if( isRequestWithKotID(req) ){
        next();
    } else {
        return res.redirect(errorHandler("BAD_KOTID"))
    }
}