export const isRequestWithConvID = (req) => {
    /*
        DEF  : On vérifie qu'il y a une convID en paramètre dans la requête
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : /
    */
    const convID = req.params.convID;
    return convID;
}