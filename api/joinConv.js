import { joinConversation } from "../functions/message/joinConversation.js";

export const apiJoinConv = (req, res, next) => {

    const database = req.app.locals.database;

    joinConversation(database, req, (error) => {
        let convID = "";
        if(req && req.body && req.body.convID){
            convID = req.body.convID;
        }
        if(error){
            return res.redirect("/invitations/" + convID + "?error="+error)
        } else {
            return res.redirect("/conversations?selectedConversationID=" + convID);
        }
    })
}