/*
titre : searchEngine
role  : 1) 
*/

// Imports
import moment from "moment";
import { getConnectedUserID, isRequestPOST, toInt, toObjectID } from '../technicals/technicals.js';
import { distance } from "fastest-levenshtein";

// Constants
const ENTRY_TYPES = ["flat", "house"];
const ENTRY_PETFRIENDLY = ["false", "small", "big"];

const convertPostedSinceToDate = (postedSince) => {
    let actualDate = new Date();
    switch(postedSince){
        case "1week":
            return moment(actualDate).subtract(7, 'days');
        case "1month":
            return moment(actualDate).subtract(1, 'months');
        case "3month":
            return moment(actualDate).subtract(3, 'months');
        case "6month":
            return moment(actualDate).subtract(6, 'months');
        case "1year":
            return moment(actualDate).subtract(1, 'years');
        default:
            return moment(actualDate).subtract(10, 'years');
    }
}

export const searchEngine = (database, req, callback) => {
    /*
        DEF  : 
        PRE  : 
        CALLBACK : 
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(!isRequestPOST(req)) return callback(["ERROR", "BAD_REQUEST"])          // est-ce que req.body est défini (GET)

    function countAppearances(words, t){
        let count = 0;
        words.forEach(word => {
            const dist = distance(word.toLowerCase(), t.toLowerCase());
            if(dist < 3) count += 1; // Si deux mots ont moins de 3 erreurs entre eux ils sont considérés comme similaire
        });
        return count;
    }

    function tf(t, d){
        return countAppearances(d, t)/d.length;
    }

    function df(t, docs){
        let freq = 0;
        docs.forEach(doc => {
            freq += tf(t, doc); 
        });
        return freq/docs.length;
    }

    function idf(t, docs){
        return Math.log(docs.length/( df(t, docs) + 1 ));
    }

    function tf_idf(t, docs, d){
        return tf(t, d) * idf(t, docs);
    }

    function tf_idf_multiwords(words, docs, d){
        let finalRes = 0;
        words.forEach(word => {
            finalRes += tf_idf(word, docs, d);
        });
        return finalRes
    }
    
    // FIX LOCALISATION

    ////// Création de la query
    const query = {};
    query.basePrice     = {$gte: 0, $lte: 100000};
    query.createdOn     = { $gte: 0 };
    query.bedrooms      = { $gte: 0 };
    query.bathrooms     = { $gte: 0 };
    query.surface       = { $gte: 0 };
    query.parking       = { $gte: 0 };

    ////// Choix des filtres
    const filter_minValue       = !["", undefined].includes(req.body.minValue);
    const filter_maxValue       = !["", undefined].includes(req.body.maxValue);
    const filter_isOpen         = !["", undefined].includes(req.body.isOpen);
    const filter_bedrooms       = !["", undefined].includes(req.body.nbbedrooms);
    const filter_bathrooms      = !["", undefined].includes(req.body.nbbathrooms);
    const filter_type           = !["", undefined].includes(req.body.type);
    const filter_surfacemin     = !["", undefined].includes(req.body.surfacemin);
    const filter_nbparkings     = !["", undefined].includes(req.body.nbparking);
    const filter_petfriendly    = !["", undefined].includes(req.body.petfriendly);
    const filter_postedSince    = !["", undefined].includes(req.body.postedSince);

    ////// On convertit les valeurs dans des formats facilement utilisables
    if(filter_minValue){
        const basePriceMin = toInt(req.body.minValue, 0, 100000, 0);
        query.basePrice.$gte = basePriceMin;
    }
    if(filter_maxValue){
        const basePriceMax = toInt(req.body.maxValue, 0, 100000, 100000);
        query.basePrice.$lte = basePriceMax;
    }
    if(filter_isOpen){
        query.isOpen = req.body.isOpen==="opened" ? true : false;
    }
    if(filter_bedrooms){
        query.bedrooms.$gte = toInt(req.body.nbbedrooms, 0, 25, 0);
    }
    if(filter_bathrooms){
        query.bathrooms.$gte = toInt(req.body.nbbathrooms, 0, 25, 0);
    }
    if(filter_type){
        query.type = ENTRY_TYPES.includes(req.body.type) ? req.body.type : ENTRY_TYPES[0];
    }
    if(filter_surfacemin){
        query.surface.$gte = toInt(req.body.surfacemin, 0, 200, 0);
    }
    if(filter_nbparkings){
        query.parking.$gte = toInt(req.body.nbparking, 0, 50, 0);
    }
    if(filter_petfriendly){
        query.petFriendly = ENTRY_PETFRIENDLY.includes(req.body.petfriendly) ? req.body.petfriendly : ENTRY_PETFRIENDLY[0];
    }
    if(filter_postedSince) body.createdOn.$gte = convertPostedSinceToDate(req.body.postedsince).valueOf();

    database.collection("kots").find(query).sort({ createdOn: -1 }).toArray(function(err, kots) {

        if(err) return callback(["ERROR", "SERVICE_ERROR"]);
        if(kots && kots.length===0) return callback(["OK", []]);

        const docs = kots.map((inside_kot) => { 
            return [...inside_kot.title.split(" "), ...inside_kot.description.split(" ")]
        })

        const queryWords = req.body.text_search.split(" ");
        const kotWithScores = [];
        const actualDateInMilliseconds = (new Date()).getTime();

        for (let index = 0; index < kots.length; index++) {
            const kot = kots[index];
    
            const tf_idf_weight = tf_idf_multiwords(queryWords, docs, [...kot.title.split(" "), ...kot.description.split(" ")]);
    
            kotWithScores.push({
                score: tf_idf_weight,
                kot: {
                    ...kot,
                    mainPictureName: kot.pictures[kot.mainPictureIndex]
                },
                kotTags: {
                    new: (actualDateInMilliseconds - kot.createdOn) < 1000*60*60*24*7, // Kot publié il y a moins d'une semaine
                    owner: kot.creatorID.toString()===userID_toObjectID.toString()
                }
            });
    
            if(kotWithScores.length === kots.length){
                kotWithScores.sort((a, b) => b.score - a.score);
    
                return callback(["OK", kotWithScores]);
            }
    
        }


    });
}