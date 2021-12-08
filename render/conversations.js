import { errorHandler } from "../errorHandler/errorHandler.js";
import { getConversations } from "../functions/message/getConversations.js";

export const renderConversations = (req, res, next) => {
    const database = req.app.locals.database;
    getConversations(database, req,
    (conversations) => {
        req.pageConfiguration.selectedConversationID = req.query.selectedConversationID;
        req.pageConfiguration.conversations = conversations;

        res.render('conversations.html', req.pageConfiguration);
    },
    (error) => { res.redirect(errorHandler(error)) });
}