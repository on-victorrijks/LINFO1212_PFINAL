import { getAskToJoinUsersForKot } from "../functions/kots/getAskToJoinForKot.js";

export const apiGetAskToJoinUsers = (req, res, next) => {

    const database = req.app.locals.database;

    getAskToJoinUsersForKot(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}