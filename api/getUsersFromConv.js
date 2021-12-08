import { getUsersDataFromConvID } from "../functions/message/getUsersDataFromConvID.js";

export const apiGetUsersFromConv = (req, res, next) => {

    const database = req.app.locals.database;

    getUsersDataFromConvID(database, req, ([status, content]) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}