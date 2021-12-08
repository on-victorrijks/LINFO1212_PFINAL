import { removeUserFromConversation } from "../functions/message/removeUserFromConversation.js";

export const apiRemoveUserFromConv = (req, res, next) => {

    const database = req.app.locals.database;

    removeUserFromConversation(database, req, (error) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: error,
        }));
        return;
    });
}