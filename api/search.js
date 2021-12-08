import { searchEngine } from "../functions/searchEngine/searchEngine.js";

export const apiSearch = (req, res, next) => {

    const database = req.app.locals.database;

    searchEngine(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    });
}