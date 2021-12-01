// Imports
import { ObjectId } from 'mongodb';
import crypto from "crypto";
import { ERRORS } from "./../../data/errors.js";
import winston from "winston";

// Constants
const MONTHS = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "aout",
    "septembre",
    "octobre",
    "novembre",
    "décembre"
];
const charactersToUseForTokens = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$";


const logConfiguration = {
    'transports': [
        new winston.transports.Console(),
        new winston.transports.File({
            level: 'error',
            filename: 'logs/errors.log'
        })
    ],
    format: winston.format.combine(
        winston.format.label({
            label: `LOG`
        }),
        winston.format.timestamp({
           format: 'MMM-DD-YYYY HH:mm:ss'
       }),
        winston.format.printf(info => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
    )
};

const logger = winston.createLogger(logConfiguration);


export const log = (code, isError=false) => {
    if(isError){
        const errorData = ERRORS[code];
        switch(errorData.importance){
            case "error":
                logger.error(code);
                break;
            case "warn":
                logger.warn(code);
                break;
            case "info":
                logger.info(code);
                break;
            case "verbose":
                logger.verbose(code);
                break;
            case "debug":
                logger.debug(code);
                break;
            case "silly":
                logger.silly(code);
                break;
        }
    } else {
        logger.debug(code);
    }
}

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

export const getConnectedUserID = (req) => {
    /*
        DEF  : On renvoie l'userID si un utilisateur est connecté, sinon on renvoie undefined
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : string|undefined
    */
    return req && req.session && req.session.userID
}

export const cutString = (val, max) => {
    /*
        DEF  : On renvoie une version coupé du paramètre val de longueur maximale max caractère
        PRE  : string (any) | max (number)
        POST : string
    */
    try {
        let string = val.toString();
        return string.slice(0,max);
    } catch {
        return "UNKNOWN";
    }
}

export const toFloat = (val, def=0.0) => {
    /*
        DEF  : On tente de transformer le paramètre val en float, si on ne peut pas on renvoie le paramètre def
        PRE  : var (any) | def (float)
        POST : float
    */
    try {
        let float = parseFloat(val);
        if(isNaN(float)) return def;
        return float;
    } catch {
        return def;
    }
}

export const toBoolean = (val) => {
    /*
        DEF  : On convertit le paramètre val en boolean selon la règle interne ("true"=true & any=false)
        PRE  : var (any)
        POST : boolean
    */
   if(val==="true"){
       return true
   }
   return false
}


export const toInt = (val, min, max, def=0) => {
    /*
        DEF  : On tente de transformer le paramètre val en integer comprit entre les paramètres min et max, si on ne peut pas on renvoie def
        PRE  : var (any) | min (integer) | max (integer) | def (integer)
        POST : integer
    */
    try {
        let integer = parseInt(val);
        if(isNaN(integer)) return def;
        if(integer < min) return def;
        if(integer > max) return def;
        return integer;
    } catch {
        return def;
    }
}

export const formatDate = (date) => {
    /*
        DEF  : On renvoie la date donnée formatté pour être plus lisible
        PRE  : date (date sous un format autre que Date (ex: number))
        POST : string
    */
    const mDate = new Date(date);
    return mDate.getDate() + " " + MONTHS[mDate.getMonth()] + " " + mDate.getFullYear();
}

export const objectIDsArrayIncludes = (array, toFind, callback) => {
    /*
        DEF  : On vérifie si un mongodb.ObjectID est dans un array de mongodb.ObjectID
        PRE  : array (Array<mongodb.ObjectID>) | toFind (mongodb.ObjectID) | calback (Function(boolean))
        POST : boolean
    */  
    if(array.length===0) return callback(false);
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(element.toString() === toFind.toString()) {
            return callback(true);
        };
        if((index + 1) === array.length) {
           return  callback(false);
        };
    }

}

export const generateRandomToken = () => {
    return Array.from(crypto.randomFillSync(new Uint32Array(26)))
    .map((x) => charactersToUseForTokens[x % charactersToUseForTokens.length])
    .join('')
}