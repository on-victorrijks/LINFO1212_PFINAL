import  mongodb from 'mongodb';
import express from "express";
import consolidate from "consolidate";
import session from "express-session";
import bodyParser from "body-parser";
import https from "https";
import fs from "fs";
import multer from "multer";
import path from "path";
import url from 'url';

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
// Technicals imports
import { getConnectedUserID } from './functions/technicals/technicals.js';


////// Multer
const profilPicturesPath = path.join(__dirname, "/users/uploads/");
const upload = multer({
    dest: profilPicturesPath
});

////// Data import
const defaultProfilPicture = path.join(__dirname, "/static/imgs/user.png");

////// Express setup
const app = express()
app.engine('html', consolidate.hogan)
app.set('views', 'private');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true })); 
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
            if(error) return res.send(error);
            return res.send("user logged");
        })
    })

    app.post('/api/modifyUser', (req, res, next) => {
        modifyUser(database, req, (error) => {
            if(error) return res.send(error);
            return res.send("user modified");
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
                if(err) return res.send('ERROR WHILE UPLOADING');
                modifyUserProfilPicture(database, req, imageName, profilPicturesPath, (error) => {
                    if(error) return res.send(error);
                    return res.send("user profil picture modified");
                });
            });

        } else {
            fs.unlink(tempPath, (err) => {
                return res.send("BAD IMAGE FORMAT");
            });
        }
    })

    // ------------  VIEWS  ------------

    app.get('/', (req, res, next) => {
        const params = {
            user: null,
            page: {
                title: "Créer un compte",
                description: "Créer un compte"
            }
        }
        getUser(database, getConnectedUserID(req), (connectedUser) => {
            params.user = connectedUser;
            res.render('index.html', params);
        });
    })

    app.get('/register', (req, res, next) => {
        const params = {
            page: {
                title: "Créer un compte",
                description: "Créer un compte"
            }
        }
        res.render('register.html', params);
    })

    app.get('/login', (req, res, next) => {
        const params = {
            page: {
                title: "Connexion",
                description: "Connexion"
            }
        }
        res.render('login.html', params);
    })

    app.get('/account/settings', (req, res, next) => {
        const params = {
            page: {
                user: null,
                title: "Paramètres",
                description: "Paramètres"
            }
        }
        getUser(database, getConnectedUserID(req), (connectedUser) => {
            params.user = connectedUser;
            res.render('settings.html', params);
        });
    })

    app.get('/disconnect', (req, res, next) => {
        logoutUser(req, (done) => {
            res.redirect('/');
        });
    })

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

    
    
    app.get('*', (req, res) => {
        res.render('404error.html');
    });

    https.createServer({
        key: fs.readFileSync('./keys/key.pem'),
        cert: fs.readFileSync('./keys/cert.pem'),
        passphrase: 'ingi'
    }, app).listen(8080);

});