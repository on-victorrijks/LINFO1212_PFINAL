import { sendMessage } from "../functions/message/sendMessage.js";

export const apiSendMessage = (req, res, next) => {

    const database = req.app.locals.database;

    sendMessage(database, req, (error) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: error,
        }));
        return;
    })
}