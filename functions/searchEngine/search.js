/*
titre : search
role  : 1) vérifier la requête GET
        2) récupérer les résultats en fonction des filtres
*/

// Imports
import { getConnectedUserID, isRequestGET, toObjectID } from '../technicals/technicals.js';

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
                if(dist < 0.5) count++;
            });
        });
        return count;
    }

    function tf(t, d){
        const words = d;
        return countAppearances(words, t)/words.length;
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
    
            return callback(d[m - 1][n - 1]/Math.max(n, m));

        });

    }

    database.collection("kots").find({
        
    }).sort({ createdOn: -1 }).toArray(function(err, kots) {

        for (let index = 0; index < kots.length; index++) {
            const kot = kots[index];
            
            const queryWords = req.query.text_search.split(" ");
            const title = kot.title;
            const docs = kots.map((inside_kot) => { 
                return [...inside_kot.title.split(" "), ...inside_kot.description.split(" ")]
            })

            const tf_idf_weight = tf_idf_multiwords(queryWords, docs, [...kot.title.split(" "), ...kot.description.split(" ")]);
            console.log(title + ": " + tf_idf_weight);
            
        }

        return callback(['OK', []])

    });

}
