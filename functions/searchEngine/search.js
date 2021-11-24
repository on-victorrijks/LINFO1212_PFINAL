/*
titre : search
role  : 1) vérifier la requête GET
        2) récupérer les résultats en fonction des filtres
*/

// Imports
import moment from "moment";
import { getConnectedUserID, isRequestGET, toInt, toObjectID } from '../technicals/technicals.js';

// Constants
const ENTRY_TYPES = ["flat", "house"];
const ENTRY_PETFRIENDLY = ["false", "small", "big"];

const isSearchFormDataValid = (req) => {
    /*
        DEF  : On vérifie que les champs nécessaires pour rechercher les kots sont dans la requête GET et utilisables
        PRE  : req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>)
        POST : boolean
    */
   return   req.query.text_search !== undefined &&
            req.query.minValue !== undefined &&
            req.query.maxValue !== undefined &&
            req.query.postedsince !== undefined &&
            req.query.localisation !== undefined &&
            req.query.isOpen !== undefined &&
            req.query.nbbedrooms !== undefined &&
            req.query.nbbathrooms !== undefined &&
            req.query.type !== undefined &&
            req.query.surfacemin !== undefined &&
            req.query.nbparking !== undefined &&
            req.query.petfriendly !== undefined
}

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

export const search = (database, req, callback) => {
    /*
        DEF  : On récupère les kots pour les filtres présents dans la requête GET, on callback [type de callback, résultats]
        PRE  : database (mongodb.Db) | req (Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>) | callback (Function(False|string))
        CALLBACK : [type de callback, résultats] ([string, Array<KotObject>])
    */

    const userID_toObjectID = toObjectID(getConnectedUserID(req));

    if(userID_toObjectID==="") return callback(['ERROR', 'REQUEST']);           // l'userID de l'utilisateur connecté ne peut pas être transformé en mongodb.ObjectID
    if(!isRequestGET(req)) return callback(['ERROR', 'REQUEST']);               // est-ce que req.body est défini (GET)
    if(!isSearchFormDataValid(req)) return callback(['ERROR', 'REQUEST']);      // est-ce que les données nécessaires pour récupérer les kots sont dans la requête GET et utilisables
    

    function countAppearances(words, t){
        let count = 0;
        words.forEach(word => {
            levenshtein_dist_equi(t, word, (dist) => {
                if(dist && dist < 3) count += (3 - dist) ** 2;
                if(word.toLowerCase()===t.toLowerCase() && t.length > 2) count += 5;
            });
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

    function generateEmptyArray(m, n, callback){
        let d = [];    
        for (let i = 0; i < m; i++) {
            let temp = [];
            for (let j = 0; j < n; j++) {
                temp.push(0);
            }
            d.push(temp);

            if((i + 1) === m){
                return callback(d);
            }
        }
    }

    function levenshtein_dist_equi(word1, word2, callback){

        const m = word1.length;
        const n = word2.length;

        generateEmptyArray(m, n, (d) => {

            for (let i = 1; i < m; i++) {
                d[i][0] = i;
            }
    
            for (let j = 1; j < n; j++) {
                d[0][j] = j;
            }
    
            for (let j = 1; j < n; j++) {
                for (let i = 1; i < m; i++) {
      
                    let subCost;
                    if(word1[i].toLowerCase() == word2[j].toLowerCase()){
                        subCost = 0;
                    } else {
                        subCost = 1;
                    }
    
                    d[i][j] = Math.min(...[
                        d[i - 1][j] + 1,
                        d[i][j - 1] + 1,
                        d[i - 1][j - 1] + subCost
                    ]);
    
                }
            }
    
            return callback(d[m - 1][n - 1]);

        });

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
    const filter_minValue       = req.query.minValue !== "";
    const filter_maxValue       = req.query.maxValue !== "";
    const filter_isOpen         = req.query.isOpen !== "";
    const filter_bedrooms       = req.query.bedrooms !== "";
    const filter_bathrooms      = req.query.bathrooms !== "";
    const filter_type           = req.query.type !== "";
    const filter_surfacemin     = req.query.surfacemin !== "";
    const filter_nbparkings     = req.query.nbparking !== "";
    const filter_petfriendly    = req.query.petfriendly !== "";

    ////// On convertit les valeurs dans des formats facilement utilisables
    if(filter_minValue){
        const basePriceMin = toInt(req.query.minValue, 0, 100000, 0);
        query.basePrice.$gte = basePriceMin;
    }
    if(filter_maxValue){
        const basePriceMax = toInt(req.query.maxValue, 0, 100000, 100000);
        query.basePrice.$lte = basePriceMax;
    }
    if(filter_isOpen){
        query.isOpen = req.query.isOpen==="opened" ? true : false;
    }
    if(filter_bedrooms){
        query.bedrooms.$gte = toInt(req.query.bedrooms, 0, 25, 0);
    }
    if(filter_bathrooms){
        query.bathrooms.$gte = toInt(req.query.bathrooms, 0, 25, 0);
    }
    if(filter_type){
        query.type = ENTRY_TYPES.includes(req.query.type) ? req.query.type : ENTRY_TYPES[0];
    }
    if(filter_surfacemin){
        query.surface.$gte = toInt(req.query.surfacemin, 0, 200, 0);
    }
    if(filter_nbparkings){
        query.parking.$gte = toInt(req.query.nbparking, 0, 50, 0);
    }
    if(filter_petfriendly){
        query.petFriendly = ENTRY_PETFRIENDLY.includes(req.query.petfriendly) ? req.query.petfriendly : ENTRY_PETFRIENDLY[0];
    }
    query.createdOn.$gte = convertPostedSinceToDate(req.query.postedsince).valueOf();

    database.collection("kots").find(query).sort({ createdOn: -1 }).toArray(function(err, kots) {

        const queryWords = req.query.text_search.split(" ");
        const docs = kots.map((inside_kot) => { 
            return [...inside_kot.title.split(" "), ...inside_kot.description.split(" ")]
        })

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

                return callback(['OK', kotWithScores]);
            }

        }



    });

}
