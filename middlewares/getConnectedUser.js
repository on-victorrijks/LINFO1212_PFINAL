import { errorHandler } from "../errorHandler/errorHandler.js";
import { getConnectedUserID } from "../functions/technicals/technicals.js";
import { getUser } from "../functions/users/getUser.js";

export const getConnectedUser = function (req, res, next) {
    getUser(req.app.locals.database, getConnectedUserID(req), false, 
        (connectedUser) => {
            req.pageConfiguration.user = connectedUser;
            if(connectedUser){
                req.pageConfiguration.user.isResident = (connectedUser && connectedUser.type==="resident");
                req.pageConfiguration.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }
            next()
    },
    (error) => { return res.redirect(errorHandler(error)) });
}