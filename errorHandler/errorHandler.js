import { ERRORS } from "../data/errors.js";
import { log } from "../functions/technicals/technicals.js";

export const errorHandler = (errorCode) => {
    const errorData = ERRORS[errorCode];
    if (errorData) {
        log(errorCode, true);
        return errorData.redirectTo + "?error=" + errorCode;
    } else {
        log("UNKNOWN_ERROR", true);
        return "/?error=UNKNOWN_ERROR"
    }
}