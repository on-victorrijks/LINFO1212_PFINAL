import { errorHandler } from "../errorHandler/errorHandler.js";
import { isRequestWithConvID } from "../protections/isRequestWithConvID.js";

export const hasConvID = function(req, res, next) {
    if( isRequestWithConvID(req) ){
        next();
    } else {
        return res.redirect(errorHandler("CONVERSATION_INCORRECT"))
    }
}