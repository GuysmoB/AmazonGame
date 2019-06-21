"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const CaptchaRouter_1 = require("./routes/CaptchaRouter");
class App {
    constructor() {
        this.configFirebase = {
            apiKey: 'AIzaSyC2kOi7JfdBfX73WWA2a63ZUloYIqg_k6U',
            authDomain: 'firstwebsite-998f7.firebaseapp.com',
            databaseURL: 'https://firstwebsite-998f7.firebaseio.com',
            projectId: 'firstwebsite-998f7',
            storageBucket: 'firstwebsite-998f7.appspot.com',
            messagingSenderId: '692887605797'
        };
        //admin.initializeApp(this.configFirebase);
        this.express = express();
        this.middleware();
        this.routes();
    }
    middleware() {
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.accessControlSetUp();
    }
    // Configure API endpoints.
    routes() {
        this.express.use('/captcha', CaptchaRouter_1.default);
    }
    accessControlSetUp() {
        this.express.use(function (req, res, next) {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            // Pass to next layer of middleware
            next();
        });
    }
}
exports.default = new App().express;
