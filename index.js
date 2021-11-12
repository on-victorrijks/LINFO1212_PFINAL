import  mongodb from 'mongodb';
import express from "express";
import consolidate from "consolidate";
import session from "express-session";
import bodyParser from "body-parser";
import https from "https";
import fs from "fs";

const MongoClient = mongodb.MongoClient;

// Functions import

// Data import

// Express setup
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
	const dbo = db.db("KOTS");
    if (err) throw err;

    // ------------  API  ------------

    app.post('/api/createUser', (req, res, next) => {
        res.send("user created");
    })

    // ------------  VIEWS  ------------

    app.get('/', (req, res, next) => {
        res.send("site working")
    })
    
    app.get('*', (req, res) => {
        res.render('404error.html');
    });

    https.createServer({
        key: fs.readFileSync('./keys/key.pem'),
        cert: fs.readFileSync('./keys/cert.pem'),
        passphrase: 'ingi'
    }, app).listen(8080);

});