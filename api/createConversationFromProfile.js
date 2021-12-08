import { createConversation } from "../functions/message/createConversation.js";
import { getConnectedUserID } from "../functions/technicals/technicals.js";

export const apiCreateConversationFromProfile = (req, res, next) => {

    const database = req.app.locals.database;

    createConversation(database, {
        body: {
            numberOfUsers: 2,
            userID0: getConnectedUserID(req),
            userID1: req.params.userID 
        }
    }, (result) => {
        if(Array.isArray(result)){
            const newConversationID = result[0];
            return res.redirect("/conversations?selectedConversationID=" + newConversationID.toString());
        } else {
            res.redirect("/user/" + req.params.userID + "?error=" + result)
        }
    })
    
}