import { switchKotToFavourites } from "../functions/users/kots/switchKotToFavourites.js";

export const apiSwitchFav = (req, res, next) => {

    const database = req.app.locals.database;

    switchKotToFavourites(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}