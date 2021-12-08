import { errorHandler } from "../errorHandler/errorHandler.js";
import { getConversation } from "../functions/message/getConversation.js";

export const renderConversationInvitation = (req, res, next) => {
    const database = req.app.locals.database;
    getConversation(database, req, req.params.convID,
    (conversation) => {
        req.pageConfiguration.toJoinConversation = conversation;
        res.render('conversation_invitation.html', req.pageConfiguration);
    },
    (error) => { res.redirect(errorHandler(error)) });
}