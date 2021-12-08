import { acceptAskToJoinKot } from "../functions/users/kots/acceptAskToJoinKot.js";

export const apiAcceptAskToJoinKot = (req, res, next) => {

    const database = req.app.locals.database;

    acceptAskToJoinKot(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}