import { errorHandler } from "../errorHandler/errorHandler.js";
import { getKot } from "../functions/kots/getKot.js";
import { formatDate } from "../functions/technicals/technicals.js";

export const getKotFromKotID = function(req, res, next){
    const database = req.app.locals.database;
    getKot(database, req, req.params.kotID, req.pageConfiguration.userShouldBeCreatorOfFetchedKot, 
        (kotData) => {
            req.pageConfiguration.page.title += kotData.title;

            kotData.type = kotData.type==="flat" ? "Appartement" : "Maison";
            kotData.availabilityRaw = kotData.availability;
            kotData.availability = formatDate(kotData.availability);
            if(kotData.petFriendly==="small"){
                kotData.petFriendly = "Petits animaux autorisés";
            } else if(kotData.petFriendly==="big"){
                kotData.petFriendly = "Grands animaux autorisés";
            } else {
                kotData.petFriendly = "Pas d'animaux autorisés";
            }

            req.pageConfiguration.kot = kotData;

            next();
    },
    (error) => { return res.redirect(errorHandler(error)) });
}