import { getMessages } from "../functions/message/getMessages.js";

export const apiGetMessages = (req, res, next) => {

    const database = req.app.locals.database;

    getMessages(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}