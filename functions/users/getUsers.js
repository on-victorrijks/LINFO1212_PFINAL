/*
titre : getUsers
role  : 1) callback les données de des utilisateurs qui ont leur userID dans l'Array contenant les userIDs fourni

Interfaces:
UserObject: {
    _id: mongodb.ObjectID,
    firstname: string,
    lastname: string,
    createdOn: number (date),
    email: string,
    phonenumber: string,
    profilPicture: string,
    type: "landlord" | "resident",
    companyName: string,
    hashPassword: string
}
*/

// Imports
import { log, toObjectID, objectIDsArrayIncludes } from '../technicals/technicals.js';

export const getUsers = (database, userIDs, callback) => {
    /*
        DEF  : On cherche les utilisateur avec leur userID dans l'Array contenant des userIDs fourni et on callback les données de ces utilisateurs
        PRE  : database (mongodb.Db) | userIDs Array<(mongodb.ObjectID sous forme de string)> | callback (Function(False|string))
        CALLBACK : Array<UserObject>
    */

    const userIDs_toObjectID = userIDs.map((userID) => toObjectID(userID));
    
    database.collection("users").find({}).toArray(function(err, users) {

        if(err) return callback([]);      // Erreur reliée à mongoDB
        if(!users) return callback([]);   // Pas d'utilisateur dans la db

        log("Users fetched : " + userIDs);
        
        let filteredUsers = [];
        users.forEach((user, index) => {
            objectIDsArrayIncludes(userIDs_toObjectID, user._id, (result) => {
                if(result) filteredUsers.push({
                    ...user,
                    hashedPassword: undefined
                });
            });
            if((index + 1) === filteredUsers.length){
                return callback(filteredUsers);
            }
        });
 
    });

}
