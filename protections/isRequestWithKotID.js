export const isRequestWithKotID = (req) => {
    /*
        DEF  : On vérifie qu'il y a un KotID en paramètre dans la requête, sinon on throw une erreur
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : /
    */
    const kotID = req.params.kotID;
    return kotID!==undefined
}