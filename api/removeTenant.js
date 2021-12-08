import { removeTenant } from "../functions/kots/removeTenant.js";

export const apiRemoveTenant = (req, res, next) => {

    const database = req.app.locals.database;

    removeTenant(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}