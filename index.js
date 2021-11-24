import  mongodb from 'mongodb';
import express from "express";
import consolidate from "consolidate";
import session from "express-session";
import bodyParser from "body-parser";
import https from "https";
import fs, { stat } from "fs";
import multer from "multer";
import path from "path";
import url from 'url';
import cors from 'cors';

const MongoClient = mongodb.MongoClient;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

////// Functions imports
// Users imports
import { registerUser } from './functions/users/registerUser.js';
import { loginUser } from './functions/users/loginUser.js';
import { getUser } from './functions/users/getUser.js';
import { logoutUser } from './functions/users/logoutUser.js';
import { modifyUser } from './functions/users/modifyUser.js';
import { modifyUserProfilPicture } from './functions/users/modifyUserProfilPicture.js';
// Kots imports
import { createKot } from './functions/kots/createKot.js';
import { modifyKot } from './functions/kots/modifyKot.js';
import { getKot } from './functions/kots/getKot.js';
// Conversations imports
import { createConversation } from './functions/message/createConversation.js';
import { sendMessage } from './functions/message/sendMessage.js';
import { getMessages } from './functions/message/getMessages.js';
import { getConversations } from './functions/message/getConversations.js';
import { getConversation } from './functions/message/getConversation.js';
import { joinConversation } from './functions/message/joinConversation.js';
import { getUsersDataFromConvID } from './functions/message/getUsersDataFromConvID.js';
import { removeUserFromConversation } from './functions/message/removeUserFromConversation.js';
// Technicals imports
import { formatDate, getConnectedUserID } from './functions/technicals/technicals.js';
import { search } from './functions/searchEngine/search.js';


////// Multer
const profilPicturesPath = path.join(__dirname, "/users/uploads/");
const kotsPicturesPath = path.join(__dirname, "/kots/uploads/");;
const upload = multer({
    dest: profilPicturesPath
});

////// Data import
const defaultProfilPicture = path.join(__dirname, "/static/imgs/user.png");

////// Constants
const DEFAULT_PARAMS = {
    user: null,
    page: {
        title: "SITENAME - ",
        description: ""
    },
    menu: {
        selectedPage: {}
    },
    isResident: false,
    isLandlord: false,
}

////// Express setup
const app = express()
app.engine('html', consolidate.hogan)
app.set('views', 'private');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors());
app.use(session({
  secret: "test",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    path: '/', 
    httpOnly: true, 
    maxAge: 3600000
  }
}));
app.use(express.json({limit:'1mb'}))

MongoClient.connect('mongodb://localhost:27017', (err, db) => {
	const database = db.db("KOTS");
    if (err) throw err;

    // ------------  API  ------------

    app.post('/api/createUser', (req, res, next) => {
        registerUser(database, req, (error) => {
            if(error) return res.send(error);
            return res.send("user created");
        })
    })

    app.post('/api/loginUser', (req, res, next) => {
        loginUser(database, req, (error) => {
            if(error) return res.redirect("/login?error="+error);
            return res.redirect("/?success=CONNECTED");
        })
    })

    app.post('/api/modifyUser', (req, res, next) => {
        modifyUser(database, req, (error) => {
            if(error) return res.redirect("/account/settings?error="+error);
            return res.redirect("/account");
        })
    })

    app.post('/api/upload/profilPicture', upload.single("profilPicture"), (req, res, next) => {

        const userID = getConnectedUserID(req);
        if(userID==="") return res.redirect("/login?error=CONNECTION_NEEDED");

        const tempPath = req.file.path;
        const imageExtension = path.extname(req.file.originalname).toLowerCase();
        const imageName = userID + imageExtension;
        const targetPath = path.join(profilPicturesPath, imageName);

        if ([".png", ".jpeg", ".jpg"].includes(imageExtension)) {
            fs.rename(tempPath, targetPath, (err) => {
                if(err) return res.redirect("/account/settings?error="+error);
                modifyUserProfilPicture(database, req, imageName, profilPicturesPath, (error) => {
                    if(error) return res.send(error);
                    return res.redirect("/account");
                });
            });

        } else {
            fs.unlink(tempPath, (err) => {
                return res.redirect("/account/settings?error=BAD_FORMAT");
            });
        }
    })

    app.post('/api/kot/create', upload.array("pictures", 10), (req, res, next) => {

        const userID = getConnectedUserID(req);
        if(userID==="") return res.redirect("/login?error=CONNECTION_NEEDED");
        if(!(req && req.body)) return res.redirect("/kot/create/?error=BAD_REQUEST");

        let pictures = req.files;
        let filteredPicturesName = [];

        let mainPictureIndex = 0;
        let mainPictureName = req.body.mainPictureName ? req.body.mainPictureName : pictures[0].mainPictureName;

        // Vérifications des fichiers uploadés
        for (let i = 0; i < pictures.length; i++) {
            const picture = pictures[i];
            // Le fichier est trop gros (size > 8mb), ou il n'est pas dans un format accepté, ou c'est un doublon
            if(!["image/jpeg", "image/jpg", "image/png"].includes(picture.mimetype) || picture.size > 8000000 || filteredPicturesName.includes(picture.originalname)){
                pictures.splice(i, 1);
                i -= 1;
            } else {
                filteredPicturesName.push(picture.originalname);
                if(picture.originalname===mainPictureName) mainPictureIndex = i;
            }
        }

        if(pictures.length===0) return res.redirect("/kot/create/?error=PICTURE_NEEDED");

        createKot(database, req, mainPictureIndex, filteredPicturesName, (result) => {
            if(Array.isArray(result)){
                const newKotID = result[0];

                pictures.forEach(picture => {
                    const tempPath = picture.path;
                    const imageExtension = path.extname(picture.originalname).toLowerCase();
                    const imageName = newKotID + "_" + picture.originalname;
                    const targetPath = path.join(kotsPicturesPath, imageName);
            
                    if ([".png", ".jpeg", ".jpg"].includes(imageExtension)) {
                        fs.rename(tempPath, targetPath, () => {});
                    } else {
                        fs.unlink(tempPath, () => {});
                    }
                });

                return res.redirect("/kot/profile/"+newKotID.toString());

            } else {
                return res.redirect("/kot/create/?error=" + result);
            }
        });

    })

    app.post('/api/kot/modify', upload.array("pictures", 10), (req, res, next) => {

        const userID = getConnectedUserID(req);
        if(userID==="") return res.redirect("/?error=CONNECTION_NEEDED");

        if(!(req && req.body)) return res.redirect("/?error=BAD_REQUEST");

        getKot(database, req.body.kotID, (kotData) => {

            if(kotData.creatorID.toString() !== userID) return res.redirect("/kot/profile/" + req.body.kotID + "?error=NOT_CREATOR");
            if(req.body.binNames===undefined) return res.redirect("/kot/modify/" + req.body.kotID + "?error=BAD_REQUEST");

            const binNames = req.body.binNames.split("|");

            let pictures = req.files;
            let filteredPicturesName = [];
    
            let mainPictureIndex = 0;
            let mainPictureName = req.body.mainPictureName ? req.body.mainPictureName : pictures[0].mainPictureName;
    
            // On ne garde que les images non supprimées
            for (let i = 0; i < kotData.pictures.length; i++) {
                const alreadyUploadedPicture = kotData.pictures[i];
                if(!binNames.includes(alreadyUploadedPicture)){
                    filteredPicturesName.push(alreadyUploadedPicture);
                    if(alreadyUploadedPicture===mainPictureName) mainPictureIndex = i;
                }
            }

            let numberOfKeptPictures = filteredPicturesName.length;

            // Vérifications des fichiers uploadés
            for (let i = 0; i < pictures.length; i++) {
                const picture = pictures[i];
                // Le fichier est trop gros (size > 8mb), ou il n'est pas dans un format accepté, ou c'est un doublon
                if(!["image/jpeg", "image/jpg", "image/png"].includes(picture.mimetype) || picture.size > 8000000 || filteredPicturesName.includes(picture.originalname)){
                    pictures.splice(i, 1);
                    i -= 1;
                } else {
                    filteredPicturesName.push(picture.originalname);
                    if(picture.originalname===mainPictureName) mainPictureIndex = i + numberOfKeptPictures;
                }
            }

            if(filteredPicturesName.length===0) return res.redirect("/kot/modify/" + req.body.kotID + "?error=PICTURE_NEEDED");
    
            modifyKot(database, req, req.body.kotID, binNames, kotsPicturesPath, kotData.collocationData.kotData, mainPictureIndex, filteredPicturesName, (result) => {
                if(Array.isArray(result)){
    
                    pictures.forEach(picture => {
                        const tempPath = picture.path;
                        const imageExtension = path.extname(picture.originalname).toLowerCase();
                        const imageName = req.body.kotID + "_" + picture.originalname;
                        const targetPath = path.join(kotsPicturesPath, imageName);
                
                        if ([".png", ".jpeg", ".jpg"].includes(imageExtension)) {
                            fs.rename(tempPath, targetPath, () => {});
                        } else {
                            fs.unlink(tempPath, () => {});
                        }
                    });
    
                    return res.redirect("/kot/profile/" + req.body.kotID);
    
                } else {
                    return res.redirect("/kot/profile/" + req.body.kotID + "?error=" + result.toString());
                }
            });

        });

    })

    app.get('/conversations/create/fromkot/:kotID/:userID', (req, res, next) => {

        const connectedUserID = getConnectedUserID(req);
        if(!connectedUserID) return res.redirect("/login?error=CONNECTION_NEEDED");
        
        createConversation(database, {
            body: {
                numberOfUsers: 2,
                userID0: connectedUserID,
                userID1: req.params.userID 
            }
        }, (result) => {
            if(Array.isArray(result)){
                const newConversationID = result[0];
                return res.redirect("/conversations?selectedConversationID=" + newConversationID.toString());
            } else {
                res.redirect("/kot/profile/" + req.params.kotID + "?error=" + result)
            }
        })
        
    })

    app.post('/api/sendMessage', (req, res, next) => {
        sendMessage(database, req, (error) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: error,
            }));
            return;
        })
    })

    app.post('/api/getMessages', (req, res, next) => {
        getMessages(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/getUsersDataFromConvID', (req, res, next) => {
        getUsersDataFromConvID(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/removeUserFromConversation', (req, res, next) => {
        removeUserFromConversation(database, req, (error) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: error,
            }));
            return;
        });
    })

    app.post('/api/invitations/join', (req, res, next) => {
        joinConversation(database, req, (error) => {
            let convID = "";
            if(req && req.body && req.body.convID){
                convID = req.body.convID;
            }
            if(error){
                return res.redirect("/invitations/" + convID + "?error="+error)
            } else {
                return res.redirect("/conversations?selectedConversationID=" + convID);
            }
        })
    })

    // ------------  VIEWS  ------------

    app.get('/', (req, res, next) => {

        const params = DEFAULT_PARAMS;
        params.menu.selectedPage = {};
        params.menu.selectedPage.home = "true";
        params.page.title += "Trouver un kot";
        params.page.description = "Trouver un kot sur LLN";

        getUser(database, getConnectedUserID(req), (connectedUser) => {
            params.user = connectedUser;
            params.isResident = (connectedUser && connectedUser.type==="resident");
            params.isLandlord = (connectedUser && connectedUser.type==="landlord");
            res.render('index.html', params);
        });
    })

    app.get('/register', (req, res, next) => {

        const params = DEFAULT_PARAMS;
        params.menu.selectedPage = {};
        params.page.description = "Créer un compte";

        res.render('register.html', params);
    })

    app.get('/login', (req, res, next) => {

        const params = DEFAULT_PARAMS;
        params.menu.selectedPage = {};
        params.page.description = "Connexion";

        res.render('login.html', params);
    })

    app.get('/account/settings', (req, res, next) => {

        const params = DEFAULT_PARAMS;
        params.menu.selectedPage = {};
        params.page.title += "Paramètres";
        params.page.description = "Paramètres";

        getUser(database, getConnectedUserID(req), (connectedUser) => {
            params.user = connectedUser;
            params.isResident = (connectedUser && connectedUser.type==="resident");
            params.isLandlord = (connectedUser && connectedUser.type==="landlord");
            res.render('settings.html', params);
        });
    })

    app.get('/disconnect', (req, res, next) => {
        logoutUser(req, (done) => {
            res.redirect('/?success=DISCONNECTED');
        });
    })

    app.get('/kot/create', (req, res, next) => {

        const params = DEFAULT_PARAMS;
        params.menu.selectedPage = {};
        params.menu.selectedPage.publish = "true";
        params.page.title += "Créer un kot";
        params.page.description = "Créer un kot";

        getUser(database, getConnectedUserID(req), (connectedUser) => {
            params.user = connectedUser;
            params.isResident = (connectedUser && connectedUser.type==="resident");
            params.isLandlord = (connectedUser && connectedUser.type==="landlord");
            res.render('createKot.html', params);
        });
    })

    app.get('/kot/modify/:kotID', (req, res, next) => {

        const connectedUserID = getConnectedUserID(req);
        if(!connectedUserID) return res.redirect("/login?error=CONNECTION_NEEDED");

        const params = DEFAULT_PARAMS;
        params.menu.selectedPage = {};
        params.page.title += "Modifier un kot";
        params.page.description = "Modifier un kot";

        getKot(database, req.params.kotID, (kotData) => {

            if(!kotData) return res.redirect("/?error=BAD_KOTID");

            getUser(database, connectedUserID, (connectedUser) => {

                if(kotData.creatorID.toString() !== connectedUserID) return res.redirect("/?error=NOT_CREATOR");

                params.user = connectedUser;
                params.isResident = (connectedUser && connectedUser.type==="resident");
                params.isLandlord = (connectedUser && connectedUser.type==="landlord");

                // On génère picturesUsableData avec un structure plus facilement utilisable pour afficher les images déja uploadées
                let picturesUsableData = [];
                for (let index = 0; index < kotData.pictures.length; index++) {
                    picturesUsableData.push({
                        imageName: kotData.pictures[index],
                        index: index,
                        isMainImage: index===kotData.mainPictureIndex
                    });                 
                }
                kotData.pictures = picturesUsableData;

                const availabilityAsDate = new Date(kotData.availability);

                let day = availabilityAsDate.getDate().toString();
                let month = (availabilityAsDate.getMonth() + 1).toString();
                let year = availabilityAsDate.getFullYear().toString();

                if(day.length===1)   day = "0"+day;
                if(month.length===1) month = "0"+month;

                const preloadedDate = year+"-"+month+"-"+day;

                params.user = connectedUser;
                params.kot = kotData;
                params.formPreloader = {
                    mainPictureName: kotData.pictures[kotData.mainPictureIndex],
                    isOpen: {
                        opt1: kotData.isOpen,
                        opt2: !kotData.isOpen
                    },
                    availability: preloadedDate,
                    isCollocation: {
                        opt1: kotData.isCollocation,
                        opt2: !kotData.isCollocation
                    },
                    type: {
                        opt1: kotData.type==="flat",
                        opt2: kotData.type==="house",
                    },
                    furnished: {
                        opt1: kotData.furnished,
                        opt2: !kotData.furnished
                    },
                    petFriendly: {
                        opt1: kotData.petFriendly==="false",
                        opt2: kotData.petFriendly==="small",
                        opt3: kotData.petFriendly==="big"
                    },
                    garden: {
                        opt1: kotData.garden,
                        opt2: !kotData.garden
                    },
                    terrace: {
                        opt1: kotData.terrace,
                        opt2: !kotData.terrace
                    }
                };

                res.render('modifyKot.html', params);

            });
        });
    })

    app.get('/kot/profile/:kotID', (req, res, next) => {

        const connectedUserID = getConnectedUserID(req);

        const params = DEFAULT_PARAMS;
        params.menu.selectedPage = {};
        params.page.description = "Profil d'un kot";

        getUser(database, connectedUserID, (connectedUser) => {

            params.user = connectedUser;
            params.isResident = (connectedUser && connectedUser.type==="resident");
            params.isLandlord = (connectedUser && connectedUser.type==="landlord");
    
            getKot(database, req.params.kotID, (kotData) => {
    
                if(!kotData) return res.redirect("/?error=BAD_KOTID");
    
                kotData.type = kotData.type==="flat" ? "Appartement" : "Maison";
                kotData.availability = formatDate(kotData.availability)
                if(kotData.petFriendly==="small"){
                    kotData.petFriendly = "Petits animaux autorisés";
                } else if(kotData.petFriendly==="big"){
                    kotData.petFriendly = "Grands animaux autorisés";
                } else {
                    kotData.petFriendly = "Pas d'animaux autorisés";
                }
    
                // On génère picturesUsableData avec un structure plus facilement utilisable pour créer le carrousel d'images
                let picturesUsableData = [];
                for (let index = 0; index < kotData.pictures.length; index++) {
                    picturesUsableData.push({
                        imageName: kotData.pictures[index],
                        index: index,
                        isMainImage: index===kotData.mainPictureIndex
                    });                 
                }
                kotData.pictures = picturesUsableData;
    
                getUser(database, kotData.creatorID, (creatorData) => {
                    params.isConnectedUserTheCreator = connectedUserID && kotData.creatorID.toString()===connectedUserID
                    params.page.title += kotData.title;
                    params.creatorData = creatorData;
                    params.kot = kotData;
                    res.render('kot_profile.html', params);
                })
    
            });

        });
    })

    app.get('/conversations', (req, res, next) => {

        const connectedUserID = getConnectedUserID(req);
        if(!connectedUserID) return res.redirect("/login?error=CONNECTION_NEEDED");

        const params = DEFAULT_PARAMS;
        params.menu.selectedPage = {};
        params.menu.selectedPage.conversations = "true";
        params.page.title += "Mes conversations";
        params.page.description = "Mes conversations";

        getUser(database, connectedUserID, (connectedUser) => {
            params.user = connectedUser;
            getConversations(database, req, (result) => {
                if(Array.isArray(result)){
                    params.selectedConversationID = req.query.selectedConversationID;
                    params.conversations = result;
                    return res.render('conversations.html', params);
                } else {
                    return res.send(result);
                }
            });
        })

    })

    app.get('/invitations/:convID', (req, res, next) => {

        const connectedUserID = getConnectedUserID(req);
        if(!connectedUserID) return res.redirect("/login?error=CONNECTION_NEEDED&redirectTo=/invitations/" + req.params.convID);

        const convID = req.params.convID;
        if(!convID) return res.redirect("/?error=BAD_REQUEST");

        const params = DEFAULT_PARAMS;
        params.menu.selectedPage = {};
        params.menu.selectedPage.conversations = "true";
        params.page.title += "Invitation à rejoindre une conversation";
        params.page.description = "Invitation à rejoindre une conversation";

        getUser(database, connectedUserID, (connectedUser) => {
            params.user = connectedUser;
            getConversation(database, req, convID, ([status, content]) => {
                if(status==="OK"){
                    params.toJoinConversation = content;
                    return res.render('conversation_invitations.html', params);
                } else {
                    return res.redirect("/?error="+content)
                }
            });
        })

    })

    app.get('/search', (req, res, next) => {

        search(database, req, ([status, content]) => {
            if(status === "OK"){

            } else {
                
            }
        })

        res.send("no");
        return;

    })

    // ------------  FILES  ------------

    app.get('/users/profilPicture/:userID', function (req, res) {
        getUser(database, req.params.userID, (user) => {
            if(user && user.profilPicture !== "$DEFAULT"){
                res.sendFile(path.join(profilPicturesPath, user.profilPicture));
            } else {
                // No user for that userID, or the user with that userID doesn't have a profil picture set
                res.sendFile(defaultProfilPicture);
            }
        });
    });

    app.get('/users/kots/images/:imageName', function (req, res) {
        res.sendFile(path.join(kotsPicturesPath, req.params.imageName));
    });

    
    // ------------  ERROR404  ------------

    app.get('*', (req, res) => {
        res.render('404error.html');
    });

    https.createServer({
        key: fs.readFileSync('./keys/key.pem'),
        cert: fs.readFileSync('./keys/cert.pem'),
        passphrase: 'ingi'
    }, app).listen(8080);

});