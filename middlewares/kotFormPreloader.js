import { errorHandler } from "../errorHandler/errorHandler.js";

export const kotFormPreloader = function(req, res, next) {
    if(req.pageConfiguration && req.pageConfiguration.kot){

        const kotData = req.pageConfiguration.kot;
        const availabilityAsDate = new Date(kotData.availability);
        let day = availabilityAsDate.getDate().toString();
        let month = (availabilityAsDate.getMonth() + 1).toString();
        let year = availabilityAsDate.getFullYear().toString();
        if(day.length===1)   day = "0"+day;
        if(month.length===1) month = "0"+month;
        const preloadedDate = year+"-"+month+"-"+day;
        
        req.pageConfiguration.formPreloader = {
                mainPictureName: kotData.pictures[kotData.mainPictureIndex],
                isOpen: {
                    opt1: kotData.isOpen,
                    opt2: !kotData.isOpen
                },
                availability: preloadedDate,
                isCollocation: {
                    opt1: kotData.isCollocation,
                    opt2: !kotData.isCollocation
                },
                type: {
                    opt1: kotData.type==="flat",
                    opt2: kotData.type==="house",
                },
                furnished: {
                    opt1: kotData.furnished,
                    opt2: !kotData.furnished
                },
                petFriendly: {
                    opt1: kotData.petFriendly==="false",
                    opt2: kotData.petFriendly==="small",
                    opt3: kotData.petFriendly==="big"
                },
                garden: {
                    opt1: kotData.garden,
                    opt2: !kotData.garden
                },
                terrace: {
                    opt1: kotData.terrace,
                    opt2: !kotData.terrace
                }
        };
        next();
    } else {
        return res.redirect(errorHandler("SERVICE_ERROR"));
    }
}