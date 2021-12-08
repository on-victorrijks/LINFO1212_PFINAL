import { cancelAskToJoinKot } from "../functions/users/kots/cancelAskToJoinKot.js";

export const apiCancelAskToJoin = (req, res, next) => {

    const database = req.app.locals.database;

    cancelAskToJoinKot(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}