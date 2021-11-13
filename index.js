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
import { getKot } from './functions/kots/getKot.js';
// Technicals imports
import { formatDate, getConnectedUserID } from './functions/technicals/technicals.js';


////// Multer
const profilPicturesPath = path.join(__dirname, "/users/uploads/");
const kotsPicturesPath = path.join(__dirname, "/kots/uploads/");;
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

    app.post('/api/kot/create', upload.array("pictures", 10), (req, res, next) => {

        const userID = getConnectedUserID(req);
        if(userID==="") return res.redirect("/login?error=CONNECTION_NEEDED");

        let pictures = req.files;
        let filteredPicturesName = [];

        // Vérifications des fichiers uploadés
        let mainPictureIndex = 0;
        let mainPictureName = (req && req.body && req.body.mainPictureName) ? req.body.mainPictureName : pictures[0].mainPictureName;

        for (let i = 0; i < pictures.length; i++) {
            const picture = pictures[i];
            // Le fichier est trop gros (size > 8mb), ou il n'est pas dans un format accepté, ou c'est un doublon
            if(!["image/jpeg", "image/jpg", "image/png"].includes(picture.mimetype) || picture.size > 8000000 || filteredPicturesName.includes(picture.originalname)){
                pictures.splice(i, 1);
                i -= 1;
            } else {
                filteredPicturesName.push(picture.originalname);
                if(picture.originalname===mainPictureName) {
                    mainPictureIndex = i;
                }
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
                return res.send(result.toString());
            }
        });

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

    app.get('/kot/create', (req, res, next) => {
        const params = {
            page: {
                title: "Créer un kot",
                description: "Créer un kot"
            }
        }
        getUser(database, getConnectedUserID(req), (connectedUser) => {
            params.user = connectedUser;
            res.render('createKot.html', params);
        });
    })

    app.get('/kot/modify/:kotID', (req, res, next) => {

        const connectedUserID = getConnectedUserID(req);
        if(!connectedUserID) return res.redirect("/?error=CONNECTION_NEEDED");

        const params = {
            page: {
                title: "Modifier un kot",
                description: "Modifier un kot"
            },
            user: null,
            kot: null,
            formPreloader: null,
        }
        getKot(database, req.params.kotID, (kotData) => {

            if(!kotData) return res.redirect("/?error=BAD_KOTID");

            getUser(database, connectedUserID, (connectedUser) => {

                if(kotData.creatorID.toString() !== connectedUserID) return res.redirect("/?error=NOT_CREATOR");

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

        const params = {
            page: {
                title: "Profil d'un kot",
                description: "Profil d'un kot",
                kot: null,
                creatorData: null,
                isConnectedUserTheCreator: false,
            }
        }
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
                params.page.title = kotData.title;
                params.creatorData = creatorData;
                params.kot = kotData;
                res.render('kot_profile.html', params);
            })

        });
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