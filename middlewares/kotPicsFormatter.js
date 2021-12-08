import { errorHandler } from "../errorHandler/errorHandler.js";

export const kotPicsFormatter = function(req, res, next) {
    const kotData = req.pageConfiguration.kot;
    // On génère picturesUsableData avec un structure plus facilement utilisable pour afficher les images déja uploadées
    if(req.pageConfiguration && req.pageConfiguration.kot){
        let picturesUsableData = [];
        for (let index = 0; index < kotData.pictures.length; index++) {
            picturesUsableData.push({
                imageName: kotData.pictures[index],
                index: index,
                isMainImage: index===kotData.mainPictureIndex
            });                 
        }
        kotData.pictures = picturesUsableData;
        next();
    } else {
        return res.redirect(errorHandler("SERVICE_ERROR"));
    }
}