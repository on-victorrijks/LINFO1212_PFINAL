import { getConnectedUserNotifications } from "../functions/notifications/getNotifications.js";

export const apiGetUserNotifications = (req, res, next) => {

    const database = req.app.locals.database;

    getConnectedUserNotifications(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}