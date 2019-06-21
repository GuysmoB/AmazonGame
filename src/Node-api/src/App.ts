import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import HeroRouter from './routes/HeroRouter';
import CaptchaRouter from './routes/CaptchaRouter';
import admin = require('firebase-admin');

class App {

  public express: express.Application;
  private configFirebase = {
    apiKey: 'AIzaSyC2kOi7JfdBfX73WWA2a63ZUloYIqg_k6U',
    authDomain: 'firstwebsite-998f7.firebaseapp.com',
    databaseURL: 'https://firstwebsite-998f7.firebaseio.com',
    projectId: 'firstwebsite-998f7',
    storageBucket: 'firstwebsite-998f7.appspot.com',
    messagingSenderId: '692887605797'
  };
  
  constructor() {
    //admin.initializeApp(this.configFirebase);
    this.express = express();
    this.middleware();
    this.routes();
  }

  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.accessControlSetUp();
  }

  // Configure API endpoints.
  private routes(): void {
    this.express.use('/captcha', CaptchaRouter);
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

export default new App().express;