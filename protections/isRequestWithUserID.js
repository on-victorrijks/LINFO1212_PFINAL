export const isRequestWithUserID = (req) => {
    /*
        DEF  : On vérifie qu'il y a un userID en paramètre dans la requête
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : /
    */
    const userID = req.params.userID;
    return userID!==undefined
}