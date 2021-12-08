import { errorHandler } from "../errorHandler/errorHandler.js";
import { modifyUser } from "../functions/users/modifyUser.js";

export const apiModifyUser = (req, res, next) => {
    modifyUser(database, req, (error) => {
        if(error) return res.redirect(errorHandler(error));
        return res.redirect("/account?success=ACCOUNT_EDITED");
    })
}