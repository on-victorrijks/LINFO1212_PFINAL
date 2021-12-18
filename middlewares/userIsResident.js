import { errorHandler } from "../errorHandler/errorHandler.js";

export const userIsResident = function(req, res, next) {
    if(req.pageConfiguration.user){
        if(req.pageConfiguration.user.type==="resident"){
            next();
        } else {
            return res.redirect(errorHandler("NOT_RESIDENT"));
        }
    } else {
        return res.redirect(errorHandler("CONNECTION_NEEDED"));
    }
}