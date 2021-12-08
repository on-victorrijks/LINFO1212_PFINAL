import { refuseAskToJoinKot } from "../functions/users/kots/refuseAskToJoinKot.js";

export const apiRefuseAskToJoinKot = (req, res, next) => {
    
    const database = req.app.locals.database;

    refuseAskToJoinKot(database, req, ([status, content]) => {        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: status,
            content: content,
        }));
        return;
    })
}