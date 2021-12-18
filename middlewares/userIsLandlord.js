import { errorHandler } from "../errorHandler/errorHandler.js";

export const userIsLandlord = function(req, res, next) {
    if(req.pageConfiguration.user){
        if(req.pageConfiguration.user.type==="landlord"){
            next();
        } else {
            return res.redirect(errorHandler("NOT_LANDLORD"));
        }
    } else {
        return res.redirect(errorHandler("CONNECTION_NEEDED"));
    }
}