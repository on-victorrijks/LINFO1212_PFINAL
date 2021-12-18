import { errorHandler } from "../errorHandler/errorHandler.js";
import { registerUser } from "../functions/users/registerUser.js";

export const apiCreateUser = (req, res, next) => {

    const database = req.app.locals.database;

    registerUser(database, req, (error) => {
        if(error) return res.redirect(errorHandler(error));
        return res.redirect("/login?sucess=ACCOUNT_CREATED");
    })
}