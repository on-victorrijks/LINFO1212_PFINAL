import { getTenants } from "../functions/kots/getTenants.js";

export const apiGetTenants = (req, res, next) => {

    const database = req.app.locals.database;

    getTenants(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}