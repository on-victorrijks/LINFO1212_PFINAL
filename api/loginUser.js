import { errorHandler } from "../errorHandler/errorHandler.js";
import { loginUser } from "../functions/users/loginUser.js";

export const apiLoginUser = (req, res, next) => {

    const database = req.app.locals.database;

    loginUser(database, req, (error) => {
        if(error) return res.redirect(errorHandler(error));
        return res.redirect("/?success=CONNECTED");
    })
}