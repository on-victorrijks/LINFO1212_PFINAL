import  mongodb from 'mongodb';
import express from "express";
import consolidate from "consolidate";
import session from "express-session";
import bodyParser from "body-parser";
import https from "https";
import fs from "fs";
import multer from "multer";
import sharp from 'sharp';
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
import { deleteNotification } from './functions/notifications/deleteNotification.js';

////// Constants
const language = "fr";

MongoClient.connect('mongodb://localhost:27017', (err, db) => {
	const database = db.db("KOTS");
    if (err) throw err;

    ////// Middleware
    var MW_generateParams = function (req, res, next) {
        const urlWithoutGETParams = req.originalUrl.split("?")[0];
        const urlParts = urlWithoutGETParams.split("/");
        urlParts.shift(); // On enlève le premier élément " '' " causé par le split au dessus

        // Cas spéciaux
        /* /kot/modify/:kotID */
        if(urlParts.length >= 2 && urlParts[0]==="kot" && urlParts[1]==="modify"){
            req.pageConfiguration = generateParams("/kot/modify/:kotID");
        }
        /* /kot/profile/:kotID */
        if(urlParts.length >= 2 && urlParts[0]==="kot" && urlParts[1]==="profile"){
            req.pageConfiguration = generateParams("/kot/profile/:kotID");
        }
        /* /invitations/:convID */
        if(urlParts.length >= 1 && urlParts[0]==="invitations"){
            req.pageConfiguration = generateParams("/invitations/:convID");
        }
        /* /user/:userID */
        if(urlParts.length >= 1 && urlParts[0]==="user"){
            req.pageConfiguration = generateParams("/user/:userID");
        }

        if(!req.pageConfiguration){
            req.pageConfiguration = generateParams(urlWithoutGETParams);
        }

        next()
    }

    var MW_fetchConnectedUserData = function (req, res, next) {
        getUser(database, getConnectedUserID(req), false, 
            (connectedUser) => {
                req.pageConfiguration.user = connectedUser;
                if(connectedUser){
                    req.pageConfiguration.user.isResident = (connectedUser && connectedUser.type==="resident");
                    req.pageConfiguration.user.isLandlord = (connectedUser && connectedUser.type==="landlord");   
                }
                next()
        },
        (error) => { return res.redirect(errorHandler(error)) });
    }

    var MW_protectionUserShouldNotBeConnected = function(req, res, next) {
        if( isUserConnected(req) ){
            return res.redirect(errorHandler("ALREADY_CONNECTED"))
        } else {
            next();
        }
    }

    var MW_protectionUserShouldBeConnected = function(req, res, next) {
        if( isUserConnected(req) ){
            next();
        } else {
            return res.redirect(errorHandler("CONNECTION_NEEDED"));
        }
    } 

    var MW_protectionRequestShouldHaveKotID = function(req, res, next) {
        if( isRequestWithKotID(req) ){
            next();
        } else {
            return res.redirect(errorHandler("BAD_KOTID"))
        }
    }

    var MW_protectionRequestShouldHaveConvID = function(req, res, next) {
        if( isRequestWithConvID(req) ){
            next();
        } else {
            return res.redirect(errorHandler("CONVERSATION_INCORRECT"))
        }
    }

    var MW_protectionRequestShouldHaveUserID = function(req, res, next) {
        if( isRequestWithUserID(req) ){
            next();
        } else {
            return res.redirect(errorHandler("BAD_USERID"))
        }
    }

    var MW_protectionUserShouldBeCreatorOfFetchedKot = function(req, res, next) {
        req.userShouldBeCreatorOfFetchedKot = true;
        next();
    }

    var MW_getKot = function(req, res, next) {
        getKot(database, req, req.params.kotID, req.pageConfiguration.userShouldBeCreatorOfFetchedKot, 
        (kotData) => {
            req.pageConfiguration.page.title += kotData.title;

            kotData.type = kotData.type==="flat" ? "Appartement" : "Maison";
            kotData.availability = formatDate(kotData.availability)
            if(kotData.petFriendly==="small"){
                kotData.petFriendly = "Petits animaux autorisés";
            } else if(kotData.petFriendly==="big"){
                kotData.petFriendly = "Grands animaux autorisés";
            } else {
                kotData.petFriendly = "Pas d'animaux autorisés";
            }

            req.pageConfiguration.kot = kotData;

            next();
        },
        (error) => { return res.redirect(errorHandler(error)) });
    }

    var MW_kotPicturesFormatter = function(req, res, next) {
        const kotData = req.pageConfiguration.kot;
        // On génère picturesUsableData avec un structure plus facilement utilisable pour afficher les images déja uploadées
        if(req.pageConfiguration && req.pageConfiguration.kot){
            let picturesUsableData = [];
            for (let index = 0; index < kotData.pictures.length; index++) {
                picturesUsableData.push({
                    imageName: kotData.pictures[index],
                    index: index,
                    isMainImage: index===kotData.mainPictureIndex
                });                 
            }
            kotData.pictures = picturesUsableData;
            next();
        } else {
            return res.redirect(errorHandler("SERVICE_ERROR"));
        }
    }

    var MW_kotFormPreloader = function(req, res, next) {
        if(req.pageConfiguration && req.pageConfiguration.kot){
    
            const kotData = req.pageConfiguration.kot;

            const availabilityAsDate = new Date(kotData.availability);
            let day = availabilityAsDate.getDate().toString();
            let month = (availabilityAsDate.getMonth() + 1).toString();
            let year = availabilityAsDate.getFullYear().toString();
            if(day.length===1)   day = "0"+day;
            if(month.length===1) month = "0"+month;

            const preloadedDate = year+"-"+month+"-"+day;
            
            req.pageConfiguration.formPreloader = {
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
            next();
        } else {
            return res.redirect(errorHandler("SERVICE_ERROR"));
        }
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
    app.use(MW_generateParams);



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

        const imageExtension = path.extname(req.file.originalname).toLowerCase();
        const imageName = userID + imageExtension;
        
        modifyUserProfilPicture(database, req, imageName, profilPicturesPath, imageExtension, req.file.path, (error) => {
            if(error) return res.send(error);
            return res.redirect("/account");
        });
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

        createKot(database, req, mainPictureIndex, filteredPicturesName, ([status, content]) => {
            if(status==="OK"){
                const newKotID = content;

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
                const error = content;
                return res.redirect("/kot/create/?error=" + error);
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

    app.get('/conversations/create/fromprofile/:userID', (req, res, next) => {

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
                res.redirect("/user/" + req.params.userID + "?error=" + result)
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

    app.post('/api/notifications/deleteNotification', (req, res, next) => {
        deleteNotification(database, req, ([status, content]) => {
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

    app.get('/'                     ,MW_fetchConnectedUserData, 
    (req, res, next) => { res.render('index.html', req.pageConfiguration) })

    app.get('/register'             ,MW_protectionUserShouldNotBeConnected, 
    (req, res, next) => { res.render('register.html', req.pageConfiguration) })

    app.get('/login'                ,MW_protectionUserShouldNotBeConnected, 
    (req, res, next) => { res.render('login.html', req.pageConfiguration) })

    app.get('/disconnect'           ,MW_protectionUserShouldBeConnected, 
    (req, res, next) => { logoutUser(req, () => { res.redirect('/?success=DISCONNECTED'); }) })

    app.get('/kot/create'           ,MW_protectionUserShouldBeConnected, MW_fetchConnectedUserData, 
    (req, res, next) => { res.render('createKot.html', req.pageConfiguration) })

    app.get('/kot/modify/:kotID'    ,MW_protectionUserShouldBeConnected, MW_protectionRequestShouldHaveKotID, MW_fetchConnectedUserData, MW_protectionUserShouldBeCreatorOfFetchedKot, MW_getKot, MW_kotPicturesFormatter, MW_kotFormPreloader, 
    (req, res, next) => { res.render('modifyKot.html', req.pageConfiguration);})
    
    app.get('/kot/profile/:kotID'   ,MW_protectionRequestShouldHaveKotID, MW_fetchConnectedUserData, MW_getKot, MW_kotPicturesFormatter,
    (req, res, next) => {
        getUser(database, req.pageConfiguration.kot.creatorID, true, 
        (creatorData) => {
            req.pageConfiguration.isConnectedUserTheCreator = getConnectedUserID(req) && req.pageConfiguration.kot.creatorID.toString()===getConnectedUserID(req);
            req.pageConfiguration.creatorData = creatorData;

            res.render('kot_profile.html', req.pageConfiguration);
        },
        (error) => { res.redirect(errorHandler(error)) });
    })

    app.get('/kot/favs'             ,MW_protectionUserShouldBeConnected, MW_fetchConnectedUserData,
    (req, res, next) => {
        getUserFavouritesKots(database, getConnectedUserID(req),
        (favsKots) => {
            req.pageConfiguration.favsKots = favsKots;
            res.render('kots_favs.html', req.pageConfiguration);
        },
        (error) => { res.redirect(errorHandler(error)) })
    })

    app.get('/kot/my'               ,MW_protectionUserShouldBeConnected, MW_fetchConnectedUserData, 
    (req, res, next) => {
        getKotsPublishedByUser(database, getConnectedUserID(req),
        (ownKots) => {
            req.pageConfiguration.ownKots = ownKots;
            res.render('mykots.html', req.pageConfiguration);
        },
        (error) => { res.redirect(errorHandler(error)) })
    })

    app.get('/conversations'        ,MW_protectionUserShouldBeConnected, MW_fetchConnectedUserData, 
    (req, res, next) => {
        getConversations(database, req,
        (conversations) => {
            req.pageConfiguration.selectedConversationID = req.query.selectedConversationID;
            req.pageConfiguration.conversations = conversations;

            return res.render('conversations.html', req.pageConfiguration);
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })
    
    app.get('/invitations/:convID'  ,MW_protectionUserShouldBeConnected, MW_protectionRequestShouldHaveConvID, MW_fetchConnectedUserData, 
    (req, res, next) => {
        getConversation(database, req, req.params.convID,
        (conversation) => {
            req.pageConfiguration.toJoinConversation = conversation;
            res.render('conversation_invitation.html', req.pageConfiguration);
        },
        (error) => { res.redirect(errorHandler(error)) });
    })

    app.get('/search', MW_fetchConnectedUserData,
    (req, res, next) => {            
        const searchQuery = (req.query && req.query.text_search) ? req.query.text_search : "...";
        req.pageConfiguration.page.title += searchQuery;
        req.pageConfiguration.page.description.replace("$text_search", searchQuery);
        req.pageConfiguration.query = {
            text_search: searchQuery,
        };
        res.render('search_results.html', req.pageConfiguration);
    })

    app.get('/user/:userID', MW_protectionUserShouldBeConnected, MW_protectionRequestShouldHaveUserID, MW_fetchConnectedUserData,
    (req, res, next) => {
        const userID = req.params.userID;
        getUser(database, userID, false, 
        (requestedUser) => {

            if(requestedUser===null) return res.redirect(errorHandler("BAD_USERID"));
            if(requestedUser._id.toString()===getConnectedUserID(req)) return res.redirect(errorHandler("OWN_ACCOUNT"));

            req.pageConfiguration.profilUser = requestedUser;
            req.pageConfiguration.ownAccount = false;
            req.pageConfiguration.profilUser.isResident = (requestedUser && requestedUser.type==="resident");
            req.pageConfiguration.profilUser.isLandlord = (requestedUser && requestedUser.type==="landlord");

            req.pageConfiguration.page.title += requestedUser.firstname + " " + requestedUser.lastname;
            req.pageConfiguration.page.description.replace("$fistname", requestedUser.firstname);
            req.pageConfiguration.page.description.replace("$lastname", requestedUser.lastname);
            req.pageConfiguration.page.keywords.replace("$fistname", requestedUser.firstname);
            req.pageConfiguration.page.keywords.replace("$lastname", requestedUser.lastname);

            if(req.pageConfiguration.profilUser.isLandlord){
                // L'user demandé est un propriétaire
                getKotsPublishedByUser(database, userID,
                (publishedKots) => {
                    req.pageConfiguration.kotsPublishedByUser = publishedKots;
                    return res.render('user_profile.html', req.pageConfiguration);
                },
                (error) => { return res.redirect(errorHandler(error)) })
            } else {
                // L'user demandé est un résident
                getUserFavouritesKots(database, userID,
                (favsKots) => {
                    req.pageConfiguration.favsKots = favsKots;
                    return res.render('user_profile.html', req.pageConfiguration);
                },
                (error) => { return res.redirect(errorHandler(error)) })
            }
        },
        (error) => { return res.redirect(errorHandler(error)) });
    })

    app.get('/account', MW_protectionUserShouldBeConnected, MW_fetchConnectedUserData,
    (req, res, next) => {
        const connectedUser = req.pageConfiguration.user;

        req.pageConfiguration.profilUser = connectedUser;
        req.pageConfiguration.ownAccount = true;
        req.pageConfiguration.profilUser.isResident = (connectedUser && connectedUser.type==="resident");
        req.pageConfiguration.profilUser.isLandlord = (connectedUser && connectedUser.type==="landlord");

        req.pageConfiguration.page.title += connectedUser.firstname + " " + connectedUser.lastname;
        req.pageConfiguration.page.description.replace("$fistname", connectedUser.firstname);
        req.pageConfiguration.page.description.replace("$lastname", connectedUser.lastname);
        req.pageConfiguration.page.keywords.replace("$fistname", connectedUser.firstname);
        req.pageConfiguration.page.keywords.replace("$lastname", connectedUser.lastname);

        if(req.pageConfiguration.profilUser.isLandlord){
            // L'user demandé est un propriétaire
            getKotsPublishedByUser(database, getConnectedUserID(req),
            (publishedKots) => {
                req.pageConfiguration.kotsPublishedByUser = publishedKots;
                return res.render('user_profile.html', req.pageConfiguration);
            },
            (error) => { return res.redirect(errorHandler(error)) })
        } else {
            // L'user demandé est un résident
            getUserFavouritesKots(database, getConnectedUserID(req),
            (favsKots) => {
                req.pageConfiguration.favsKots = favsKots;
                return res.render('user_profile.html', req.pageConfiguration);
            },
            (error) => { return res.redirect(errorHandler(error)) })
        }
    })

    app.get('/account/settings', MW_protectionUserShouldBeConnected, MW_fetchConnectedUserData,
    (req, res, next) => {
        return res.render('settings.html', req.pageConfiguration);
    })

    app.get('/presentation', MW_fetchConnectedUserData,
    (req, res, next) => {
        return res.render('presentation.html', req.pageConfiguration);
    })

    app.get('/contact', MW_fetchConnectedUserData,
    (req, res, next) => {
        return res.render('contact.html', req.pageConfiguration);
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