"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fetch = require("node-fetch");
const svgCaptcha = require("svg-captcha");
const CryptoService_1 = require("../services/CryptoService");
class CaptchaRouter {
    constructor(crypto) {
        this.crypto = crypto;
        this.svgConfig = {
            noise: 4,
            ignoreChars: '0oilI',
            color: true
        };
        this.router = express_1.Router();
        this.init();
    }
    /**
     * Initialise les différentes routes.
     */
    init() {
        this.router.get('/google', (req, res, next) => {
            this.getCaptchaVerification(req, res, next);
        });
        this.router.get('/svg', (req, res, next) => {
            this.sendSvgCaptcha(req, res, next);
        });
        this.router.get('/svg/result', (req, res, next) => {
            this.sendSvgResult(req, res, next);
        });
    }
    /**
     * Envoi un captcha sous balise <svg> et sa réponse
     */
    sendSvgCaptcha(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const captcha = svgCaptcha.create(this.svgConfig);
            const text = this.crypto.encrypt(captcha.text);
            const object = {
                text: text.toString(),
                data: captcha.data
            };
            res.status(200).send(object);
        });
    }
    /**
     * Envoi un boolean en fonction du résultat du captcha
     */
    sendSvgResult(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = req.query.text;
            const uncryptText = this.crypto.decrypt(text);
            /* console.log('text', text);
            console.log('uncryptText', uncryptText); */
            const result = req.query.result;
            if (uncryptText === result) {
                res.status(200).send(true);
            }
            else {
                res.status(200).send(false);
            }
        });
    }
    /**
     * Effectue un appel à l'api de Google pour la vérification du token recaptcha.
     */
    getCaptchaVerification(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.query.token;
            const secret = '6LftnKEUAAAAAGZ9jeucwKm3ZO8ioyt33My7Q1x0';
            const url = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secret + '&response=' + token;
            const googleResponse = yield this.fetchData(url);
            if (googleResponse) {
                res.status(200).send({ googleResponse });
            }
            else {
                res.status(404).send({ status: res.status });
            }
        });
    }
    /**
     * Fait appel à une api.
     * @param url
     */
    fetchData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(url);
                return yield response.json();
            }
            catch (error) {
                return 'fetchData() - ' + error;
            }
        });
    }
}
exports.CaptchaRouter = CaptchaRouter;
const captchaRouter = new CaptchaRouter(new CryptoService_1.CryptoService);
captchaRouter.init();
exports.default = captchaRouter.router;
