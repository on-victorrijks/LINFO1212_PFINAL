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
import { switchKotToFavourites } from './functions/users/kots/switchKotToFavourites.js';
// Kots imports
import { createKot } from './functions/kots/createKot.js';
import { modifyKot } from './functions/kots/modifyKot.js';
import { getKot } from './functions/kots/getKot.js';
import { getKotsPublishedByUser } from './functions/kots/getKotsPublishedByUser.js';
import { getUserFavouritesKots } from './functions/users/kots/getUserFavouritesKots.js';
// Conversations imports
import { createConversation } from './functions/message/createConversation.js';
import { sendMessage } from './functions/message/sendMessage.js';
import { getMessages } from './functions/message/getMessages.js';
import { getConversations } from './functions/message/getConversations.js';
import { getConversation } from './functions/message/getConversation.js';
import { joinConversation } from './functions/message/joinConversation.js';
import { getUsersDataFromConvID } from './functions/message/getUsersDataFromConvID.js';
import { removeUserFromConversation } from './functions/message/removeUserFromConversation.js';
// Search engine
import { search } from './functions/searchEngine/search.js';
// Technicals imports
import { formatDate, getConnectedUserID, log } from './functions/technicals/technicals.js';
import { isUserConnected } from './protections/isUserConnected.js';
import { isRequestWithConvID } from './protections/isRequestWithConvID.js';
import { isRequestWithKotID } from './protections/isRequestWithKotID.js';
import { isRequestWithUserID } from './protections/isRequestWithUserID.js';
// Collocation
import { askToJoinKot } from './functions/users/kots/askToJoinKot.js';
import { cancelAskToJoinKot } from './functions/users/kots/cancelAskToJoinKot.js';

////// Multer
const profilPicturesPath = path.join(__dirname, "/users/uploads/");
const kotsPicturesPath = path.join(__dirname, "/kots/uploads/");;
const upload = multer({
    dest: profilPicturesPath
});

////// Data import
const defaultProfilPicture = path.join(__dirname, "/static/imgs/user.png");
import { ERRORS } from "./data/errors.js";
import { PAGES_METAS } from "./data/pages_metas.js";
import { getTenants } from './functions/kots/getTenants.js';
import { getAskToJoinUsersForKot } from './functions/kots/getAskToJoinForKot.js';
import { acceptAskToJoinKot } from './functions/users/kots/acceptAskToJoinKot.js';
import { refuseAskToJoinKot } from './functions/users/kots/refuseAskToJoinKot.js';
import { removeTenant } from './functions/kots/removeTenant.js';
import { getConnectedUserNotifications } from './functions/notifications/getNotifications.js';
import { searchEngine } from './functions/searchEngine/searchEngine.js';

////// Constants
const language = "fr";
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



const errorHandler = (errorCode) => {


    const errorData = ERRORS[errorCode];
    if (errorData) {
        log(errorCode, true);
        return errorData.redirectTo + "?error=" + errorCode;
    } else {

    }

    return "/?error=UNKNOWN_ERROR"

}

const generateParams = (pageCode) => {
    const params = {
        user: null,
        page: {
            title: "SITENAME - ",
            description: "",
            icon: "defaultIcon.png",
            keywords: "",
            copyright: "//FIX",
            charset: "UTF-8"
        },
        menu: {
            selectedPage: {}
        },
        isResident: false,
        isLandlord: false,
    };

    const pageMetas = PAGES_METAS[language][pageCode];
    if (pageMetas) {
        params.page.title       += pageMetas["title"];
        params.page.description  = pageMetas["description"];
        params.page.icon         = pageMetas["icon"];
        params.page.keywords     = pageMetas["keywords"];
        params.page.copyright    = pageMetas["copyright"];
        params.page.charset      = pageMetas["charset"];
        params.menu.selectedPage[  pageMetas["selectedPage"]  ] = true;
    }

    return params
}


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

        getKot(database, req, req.body.kotID, true, (kotData) => {

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
    
            modifyKot(database, req, req.body.kotID, binNames, kotsPicturesPath, kotData.collocationData.tenantsID, mainPictureIndex, filteredPicturesName, (result) => {
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

    app.post('/api/switchFavourite', (req, res, next) => {
        switchKotToFavourites(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/collocation/askToJoin', (req, res, next) => {
        askToJoinKot(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/collocation/cancelAskToJoinKot', (req, res, next) => {
        cancelAskToJoinKot(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/collocation/getTenants', (req, res, next) => {
        getTenants(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/collocation/getAskToJoinUsers', (req, res, next) => {
        getAskToJoinUsersForKot(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/collocation/acceptAskToJoinKot', (req, res, next) => {
        acceptAskToJoinKot(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/collocation/refuseAskToJoinKot', (req, res, next) => {
        refuseAskToJoinKot(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/collocation/removeTenant', (req, res, next) => {
        removeTenant(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })

    app.post('/api/notifications/getConnectedUserNotifications', (req, res, next) => {
        getConnectedUserNotifications(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        })
    })   
    
    app.post('/api/search/', (req, res, next) => {
        searchEngine(database, req, ([status, content]) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: status,
                content: content,
            }));
            return;
        });
    })


    // ------------  VIEWS  ------------

    app.get('/', (req, res, next) => {
        const params = generateParams("/");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }

            res.render('index.html', params);
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/register', (req, res, next) => {
        if(isUserConnected(req)) return res.redirect(errorHandler("ALREADY_CONNECTED"));
        const params = generateParams("/register");
        
        res.render('register.html', params);
    })

    app.get('/login', (req, res, next) => {
        if(isUserConnected(req)) return res.redirect(errorHandler("ALREADY_CONNECTED"));
        const params = generateParams("/login");
        
        res.render('login.html', params);
    })

    app.get('/disconnect', (req, res, next) => {
        logoutUser(req, (done) => {
            res.redirect('/?success=DISCONNECTED');
        });
    })

    app.get('/kot/create', (req, res, next) => {
        if(!isUserConnected(req)) return res.redirect(errorHandler("CONNECTION_NEEDED"));
        const params = generateParams("/kot/create");
        
        getUser(database, getConnectedUserID(req), true, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }

            return res.render('createKot.html', params);
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/kot/modify/:kotID', (req, res, next) => {
        if(!isUserConnected(req)) return res.redirect(errorHandler("CONNECTION_NEEDED"));
        if(!isRequestWithKotID(req)) return res.redirect(errorHandler("BAD_KOTID"));
        const params = generateParams("/kot/modify/:kotID");
        
        getUser(database, getConnectedUserID(req), true, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }

            getKot(database, req, req.params.kotID, true, 
            (kotData) => {
                params.page.title += kotData.title;

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

                return res.render('modifyKot.html', params);
            },
            (error) => { return res.redirect(errorHandler(error)) });
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/kot/profile/:kotID', (req, res, next) => {
        if(!isRequestWithKotID(req)) return res.redirect(errorHandler("BAD_KOTID"));
        const params = generateParams("/kot/profile/:kotID");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }

            getKot(database, req, req.params.kotID, false, 
            (kotData) => {
                params.page.title += kotData.title;
                params.page.description += kotData.description;
                params.page.keywords += kotData.description.replace(" ", ",");

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
    
                getUser(database, kotData.creatorID, true, 
                (creatorData) => {
                    params.isConnectedUserTheCreator = getConnectedUserID(req) && kotData.creatorID.toString()===getConnectedUserID(req);
                    params.page.title = kotData.title;
                    params.creatorData = creatorData;
                    params.kot = kotData;

                    res.render('kot_profile.html', params);
                },
                (error) => { return res.redirect(errorHandler(error)) });
            },
            (error) => { return res.redirect(errorHandler(error)) });
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/kot/favs', (req, res, next) => {
        if(!isUserConnected(req)) return res.redirect(errorHandler("CONNECTION_NEEDED"));
        const params = generateParams("/kot/favs");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }
            getUserFavouritesKots(database, getConnectedUserID(req),
            (kots) => {
                params.favsKots = kots;
                return res.render('kots_favs.html', params);
            },
            (error) => { return res.redirect(errorHandler(error)) })
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/kot/my', (req, res, next) => {
        if(!isUserConnected(req)) return res.redirect(errorHandler("CONNECTION_NEEDED"));
        const params = generateParams("/kot/my");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }
            getKotsPublishedByUser(database, getConnectedUserID(req),
            (kots) => {
                params.ownKots = kots;
                return res.render('mykots.html', params);
            },
            (error) => { return res.redirect(errorHandler(error)) })
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/conversations', (req, res, next) => {
        if(!isUserConnected(req)) return res.redirect(errorHandler("CONNECTION_NEEDED"));
        const params = generateParams("/conversations");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }

            getConversations(database, req,
            (conversations) => {
                params.selectedConversationID = req.query.selectedConversationID;
                params.conversations = conversations;

                return res.render('conversations.html', params);
            },
            (error) => { return res.redirect(errorHandler(error)) });
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })
    
    app.get('/invitations/:convID', (req, res, next) => {
        if(!isUserConnected(req)) return res.redirect(errorHandler("CONNECTION_NEEDED"));
        if(!isRequestWithConvID(req)) return res.redirect(errorHandler("CONVERSATION_INCORRECT"));
        const params = generateParams("/invitations/:convID");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }

            getConversation(database, req, req.params.convID,
            (conversation) => {
                params.toJoinConversation = conversation;

                return res.render('conversation_invitations.html', params);
            },
            (error) => { return res.redirect(errorHandler(error)) });
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/search', (req, res, next) => {
        const params = generateParams("/search");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }
            
            const searchQuery = (req.query && req.query.text_search) ? req.query.text_search : "...";
            params.page.title += searchQuery;
            params.page.description.replace("$text_search", searchQuery);
            params.query = {
                text_search: searchQuery,
            };

            return res.render('search_results.html', params);
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/user/:userID', (req, res, next) => {
        if(!isUserConnected(req)) return res.redirect(errorHandler("CONNECTION_NEEDED"));
        if(!isRequestWithUserID(req)) return res.redirect(errorHandler("BAD_USERID"));
        const params = generateParams("/user/:userID");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }

            getUser(database, req.params.userID, false, 
            (requestedUser) => {

                if(requestedUser===null) return res.redirect(errorHandler("BAD_USERID"));
                if(requestedUser._id.toString()===getConnectedUserID(req)) return res.redirect(errorHandler("OWN_ACCOUNT"));

                params.profilUser = requestedUser;
                params.ownAccount = false;
                params.profilUser.isResident = (requestedUser && requestedUser.type==="resident");
                params.profilUser.isLandlord = (requestedUser && requestedUser.type==="landlord");

                params.page.title += requestedUser.firstname + " " + requestedUser.lastname;
                params.page.description.replace("$fistname", requestedUser.firstname);
                params.page.description.replace("$lastname", requestedUser.lastname);
                params.page.keywords.replace("$fistname", requestedUser.firstname);
                params.page.keywords.replace("$lastname", requestedUser.lastname);

                if(params.profilUser.isLandlord){
                    // L'user demandé est un propriétaire
                    getKotsPublishedByUser(database, req.params.userID,
                    (kots) => {
                        params.kotsPublishedByUser = kots;
                        return res.render('user_profile.html', params);
                    },
                    (error) => { return res.redirect(errorHandler(error)) })
                } else {
                    // L'user demandé est un résident
                    getUserFavouritesKots(database, req.params.userID,
                    (kots) => {
                        params.favsKots = kots;
                        return res.render('user_profile.html', params);
                    },
                    (error) => { return res.redirect(errorHandler(error)) })
                }
            },
            (error) => { return res.redirect(errorHandler(error)) });
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/account', (req, res, next) => {
        if(!isUserConnected(req)) return res.redirect(errorHandler("CONNECTION_NEEDED"));
        const params = generateParams("/account");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }

            params.profilUser = connectedUser;
            params.ownAccount = true;
            params.profilUser.isResident = (connectedUser && connectedUser.type==="resident");
            params.profilUser.isLandlord = (connectedUser && connectedUser.type==="landlord");

            params.page.title += connectedUser.firstname + " " + connectedUser.lastname;
            params.page.description.replace("$fistname", connectedUser.firstname);
            params.page.description.replace("$lastname", connectedUser.lastname);
            params.page.keywords.replace("$fistname", connectedUser.firstname);
            params.page.keywords.replace("$lastname", connectedUser.lastname);

            if(params.profilUser.isLandlord){
                // L'user demandé est un propriétaire
                getKotsPublishedByUser(database, getConnectedUserID(req),
                (kots) => {
                    params.kotsPublishedByUser = kots;
                    return res.render('user_profile.html', params);
                },
                (error) => { return res.redirect(errorHandler(error)) })
            } else {
                // L'user demandé est un résident
                getUserFavouritesKots(database, getConnectedUserID(req),
                (kots) => {
                    params.favsKots = kots;
                    return res.render('user_profile.html', params);
                },
                (error) => { return res.redirect(errorHandler(error)) })
            }
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/account/settings', (req, res, next) => {
        if(!isUserConnected(req)) return res.redirect(errorHandler("CONNECTION_NEEDED"));
        const params = generateParams("/account/settings");
        
        getUser(database, getConnectedUserID(req), false, 
        (connectedUser) => {
            params.user = connectedUser;
            if(connectedUser){
                params.user.isResident = (connectedUser && connectedUser.type==="resident");
                params.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
            }

            return res.render('settings.html', params);
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    // ------------  FILES  ------------

    app.get('/users/profilPicture/:userID', function (req, res) {
        getUser(database, req.params.userID, false, 
        (requestedUser) => {
            if(requestedUser && requestedUser.profilPicture !== "$DEFAULT"){
                return res.sendFile(path.join(profilPicturesPath, requestedUser.profilPicture));
            } else {
                // No user for that userID, or the user with that userID doesn't have a profil picture set
                return res.sendFile(defaultProfilPicture);
            }
        },
        (error) => { 
            errorHandler(error);
            return res.sendFile(defaultProfilPicture);
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