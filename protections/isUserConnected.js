import { getConnectedUserID } from "../functions/technicals/technicals.js";

export const isUserConnected = (req) => {
    /*
        DEF  : On vérifie que il y a un utilisateur connecté, si il n'est pas connecté on throw une erreur
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : /
    */
    const connectedUserID = getConnectedUserID(req);
    return connectedUserID

}