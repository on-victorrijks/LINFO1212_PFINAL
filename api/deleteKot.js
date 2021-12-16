import { deleteKot } from "../functions/kots/deleteKot.js";

export const apiDeleteKot = (req, res, next) => {

    const database = req.app.locals.database;

    deleteKot(database, req, req.params.kotID, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    });

}