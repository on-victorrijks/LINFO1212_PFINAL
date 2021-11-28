import { getConnectedUserID } from "../functions/technicals/technicals.js";

export const userShouldNotBeConnected = (req) => {
    /*
        DEF  : On vérifie que il n'y a pas un utilisateur connecté, si il y en a un  on throw une erreur
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : /
    */
    const connectedUserID = getConnectedUserID(req);
    
    if(connectedUserID) throw "ALREADY_CONNECTED";

}