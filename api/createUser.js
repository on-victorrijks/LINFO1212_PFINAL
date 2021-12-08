import { errorHandler } from "../errorHandler/errorHandler.js";
import { registerUser } from "../functions/users/registerUser.js";

export const apiCreateUser = (req, res, next) => {
    registerUser(database, req, (error) => {
        if(error) return res.redirect(errorHandler(error));
        return res.redirect("/login?sucess=ACCOUNT_CREATED");
    })
}