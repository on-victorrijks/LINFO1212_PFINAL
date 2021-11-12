import { ObjectId } from 'mongodb';

export const isPasswordValid = (password) => {
    /*
        DEF  : On vérifie si le paramètre password est utilisable, d'une longueur supérieure ou égale à 6 est inférieure ou égale a 256
        PRE  : password (string)
        POST : boolean
    */
    try{
     const passwordString = password.toString();
     return passwordString.length >= 6 &&
            passwordString.length <= 256
    } catch {
     return false
    }
}

export const toObjectID = (raw) => {
    /*
        DEF  : On tente de transformer le paramètre raw en ObjectID
        PRE  : raw (any)
        POST : Mongodb.ObjectId | ""
    */
    try{
        return new ObjectId(raw)
    } catch {
        return ""
    }
}

export const isRequestPOST = (req) => {
    /*
        DEF  : On vérifie que la requête à un contenu POST
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return req.body!==undefined
}

export const isRequestGET = (req) => {
    /*
        DEF  : On vérifie que la requête à un contenu GET
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
    return req.query!==undefined
}

export const log = (elm) => {
    //FIX
    console.log(elm);
}

export const getConnectedUserID = (req) => {
    /*
        DEF  : On renvoie l'userID si un utilisateur est connecté, sinon on renvoie undefined
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : string|undefined
    */
    return req && req.session && req.session.userID
}