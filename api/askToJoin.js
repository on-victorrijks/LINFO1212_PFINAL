import { askToJoinKot } from "../functions/users/kots/askToJoinKot.js";

export const apiAskToJoin = (req, res, next) => {

    const database = req.app.locals.database;

    askToJoinKot(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}