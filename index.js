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
import { getUser } from './functions/users/getUser.js';
import { logoutUser } from './functions/users/logoutUser.js';
import { switchKotToFavourites } from './functions/users/kots/switchKotToFavourites.js';
// Kots imports
import { modifyKot } from './functions/kots/modifyKot.js';
import { getKot } from './functions/kots/getKot.js';
// Conversations imports
import { createConversation } from './functions/message/createConversation.js';
import { sendMessage } from './functions/message/sendMessage.js';
import { getMessages } from './functions/message/getMessages.js';
import { joinConversation } from './functions/message/joinConversation.js';
import { getUsersDataFromConvID } from './functions/message/getUsersDataFromConvID.js';
import { removeUserFromConversation } from './functions/message/removeUserFromConversation.js';
// Technicals imports
import { getConnectedUserID } from './functions/technicals/technicals.js';
// Collocation imports
import { askToJoinKot } from './functions/users/kots/askToJoinKot.js';
import { cancelAskToJoinKot } from './functions/users/kots/cancelAskToJoinKot.js';
import { removeTenant } from './functions/kots/removeTenant.js';
import { getTenants } from './functions/kots/getTenants.js';
import { getAskToJoinUsersForKot } from './functions/kots/getAskToJoinForKot.js';
import { acceptAskToJoinKot } from './functions/users/kots/acceptAskToJoinKot.js';
import { refuseAskToJoinKot } from './functions/users/kots/refuseAskToJoinKot.js';
// Notifications imports
import { getConnectedUserNotifications } from './functions/notifications/getNotifications.js';
import { deleteNotification } from './functions/notifications/deleteNotification.js';
// Search imports
import { searchEngine } from './functions/searchEngine/searchEngine.js';

////// Middlewares
import { generateParams } from './middlewares/generateParams.js';

////// ErrorHandler
import { errorHandler } from './errorHandler/errorHandler.js';

////// Middlewares
import { getConnectedUser } from './middlewares/getConnectedUser.js';
import { userConnected } from './middlewares/userConnected.js';
import { userNotConnected } from './middlewares/userNotConnected.js';
import { hasKotID } from './middlewares/hasKotID.js';
import { hasConvID } from './middlewares/hasConvID.js';
import { hasUserID } from './middlewares/hasUserID.js';
import { connnectedUserIsCreator } from './middlewares/connnectedUserIsCreator.js';
import { getKotFromKotID } from './middlewares/getKotFromKotID.js';
import { kotPicsFormatter } from './middlewares/kotPicsFormatter.js';
import { kotFormPreloader } from './middlewares/kotFormPreloader.js';

////// Render
import { renderIndex } from './render/index.js';
import { renderRegister } from './render/register.js';
import { renderLogin } from './render/login.js';
import { renderKotCreate } from './render/kotCreate.js';
import { renderKotModify } from './render/kotModify.js';
import { renderKotProfile } from './render/kotProfile.js';
import { renderKotFavs } from './render/kotFavs.js';
import { renderKotMy } from './render/kotMy.js';
import { renderConversations } from './render/conversations.js';
import { renderConversationInvitation } from './render/conversationInvitation.js';
import { renderSearch } from './render/search.js';
import { renderUserProfile } from './render/userProfile.js';
import { renderAccount } from './render/account.js';
import { renderSettings } from './render/settings.js';
import { renderPresentation } from './render/presentation.js';
import { renderContact } from './render/contact.js';

////// API
import { apiCreateUser } from './api/createUser.js';
import { apiLoginUser } from './api/loginUser.js';
import { apiModifyUser } from './api/modifyUser.js';
import { apiChangeProfilePicture } from './api/changeProfilPicture.js';
import { apiCreateKot } from './api/createKot.js';
import { apiModifyKot } from './api/modifyKot.js';
import { apiCreateConversationFromKot } from './api/createConversationFromKot.js';
import { apiCreateConversationFromProfile } from './api/createConversationFromProfile.js';
import { apiSendMessage } from './api/sendMessage.js';
import { apiGetMessages } from './api/getMessages.js';

////// Multer
export const profilPicturesPath = path.join(__dirname, "/users/uploads/");
export const kotsPicturesPath = path.join(__dirname, "/kots/uploads/");;
export const upload = multer({
    dest: profilPicturesPath
});

////// Data import
export const defaultProfilPicture = path.join(__dirname, "/static/imgs/user.png");

////// Constants
export const GLOBAL_language = "fr";

MongoClient.connect('mongodb://localhost:27017', (err, db) => {

    if (err) throw err;

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
    app.use(generateParams);

	const database = db.db("KOTS");
    app.locals.database = database;

    // ------------  API  ------------

    app.post('/api/createUser', userNotConnected, apiCreateUser);
    app.post('/api/loginUser', userNotConnected, apiLoginUser);
    app.post('/api/modifyUser', userConnected, apiModifyUser);
    app.post('/api/upload/profilPicture', userConnected, upload.single("profilPicture"), apiChangeProfilePicture);
    app.post('/api/kot/create', userConnected, upload.array("pictures", 10), apiCreateKot);
    app.post('/api/kot/modify', userConnected, upload.array("pictures", 10), apiModifyKot);
    app.get('/conversations/create/fromkot/:kotID/:userID', userConnected, hasKotID, hasUserID, apiCreateConversationFromKot);
    app.get('/conversations/create/fromprofile/:userID', userConnected, hasUserID, apiCreateConversationFromProfile);
    app.post('/api/sendMessage', userConnected, apiSendMessage);
    app.post('/api/getMessages', userConnected, apiGetMessages);
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

    app.get('/', getConnectedUser, renderIndex);
    app.get('/register', userNotConnected, renderRegister);
    app.get('/login', userNotConnected, renderLogin);
    app.get('/disconnect', userConnected, logoutUser);
    app.get('/kot/create', userConnected, getConnectedUser, renderKotCreate);
    app.get('/kot/modify/:kotID', userConnected, hasKotID, getConnectedUser, connnectedUserIsCreator, getKotFromKotID, kotPicsFormatter, kotFormPreloader, renderKotModify);
    app.get('/kot/profile/:kotID', hasKotID, getConnectedUser, getKotFromKotID, kotPicsFormatter, renderKotProfile);
    app.get('/kot/favs', userConnected, getConnectedUser, renderKotFavs);
    app.get('/kot/my', userConnected, getConnectedUser, renderKotMy);
    app.get('/conversations', userConnected, getConnectedUser, renderConversations);
    app.get('/invitations/:convID'  ,userConnected, hasConvID, getConnectedUser, renderConversationInvitation);
    app.get('/search', getConnectedUser, renderSearch);
    app.get('/user/:userID', userConnected, hasUserID, getConnectedUser, renderUserProfile);
    app.get('/account', userConnected, getConnectedUser, renderAccount);
    app.get('/account/settings', userConnected, getConnectedUser, renderSettings);
    app.get('/presentation', getConnectedUser, renderPresentation);
    app.get('/contact', getConnectedUser, renderContact);


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