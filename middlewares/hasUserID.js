import { errorHandler } from "../errorHandler/errorHandler.js";
import { isRequestWithUserID } from "../protections/isRequestWithUserID.js";

export const hasUserID = function(req, res, next) {
    if( isRequestWithUserID(req) ){
        next();
    } else {
        return res.redirect(errorHandler("BAD_USERID"))
    }
}