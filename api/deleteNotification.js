import { deleteNotification } from "../functions/notifications/deleteNotification.js";

export const apiDeleteNotification = (req, res, next) => {
    
    const database = req.app.locals.database;

    deleteNotification(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}