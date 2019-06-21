import { Router, Request, Response, NextFunction } from 'express';
import fetch = require('node-fetch');
import svgCaptcha = require('svg-captcha');
import { CryptoService } from '../services/CryptoService';


export class CaptchaRouter {

    public router: Router;
    private svgConfig = {
        noise: 4,
        ignoreChars: '0oilI',
        color: true
    }

    constructor (public crypto: CryptoService) { 
        this.router = Router();
        this.init();
    }

    /**
     * Initialise les différentes routes.
     */
    init() {
        this.router.get('/google', (req: Request, res: Response, next: NextFunction) => {         
            this.getCaptchaVerification(req, res, next);
        }); 
        this.router.get('/svg', (req: Request, res: Response, next: NextFunction) => {
            this.sendSvgCaptcha(req, res, next);
        }); 
        this.router.get('/svg/result', (req: Request, res: Response, next: NextFunction) => {
            this.sendSvgResult(req, res, next);
        });
    }

    /**
     * Envoi un captcha sous balise <svg> et sa réponse
     */
    async sendSvgCaptcha(req: Request, res: Response, next: NextFunction) {
        const captcha = svgCaptcha.create(this.svgConfig);
        const text = this.crypto.encrypt(captcha.text);
        const object = {
            text: text.toString(),
            data: captcha.data
        }
        res.status(200).send(object);
    }

    /**
     * Envoi un boolean en fonction du résultat du captcha
     */
    async sendSvgResult(req: Request, res: Response, next: NextFunction) {
        const text = req.query.text;
        const uncryptText = this.crypto.decrypt(text);
        /* console.log('text', text);
        console.log('uncryptText', uncryptText); */

        const result = req.query.result;
        if (uncryptText === result) {
            res.status(200).send(true);    
        } else {
            res.status(200).send(false);  
        }
    }

    /**
     * Effectue un appel à l'api de Google pour la vérification du token recaptcha.
     */
    async getCaptchaVerification(req: Request, res: Response, next: NextFunction) {  
        const token = req.query.token
        const secret = '6LftnKEUAAAAAGZ9jeucwKm3ZO8ioyt33My7Q1x0';
        const url = 'https://www.google.com/recaptcha/api/siteverify?secret=' +secret +'&response=' +token;
        const googleResponse = await this.fetchData(url);
        if (googleResponse) {
            res.status(200).send({  googleResponse });
        } else {
            res.status(404).send({ status: res.status });
        }
    }

    /**
     * Fait appel à une api.
     * @param url 
     */
    async fetchData(url: string) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
           return 'fetchData() - ' +error;
        }
    }

}

const captchaRouter = new CaptchaRouter(new CryptoService);
captchaRouter.init();
export default captchaRouter.router;