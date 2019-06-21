"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoTS = require("crypto-ts");
class CryptoService {
    constructor() { }
    encrypt(text) {
        return CryptoTS.AES.encrypt(text, 'secret key 123');
    }
    decrypt(text) {
        const bytes = CryptoTS.AES.decrypt(text.toString(), 'secret key 123');
        return bytes.toString(CryptoTS.enc.Utf8);
    }
}
exports.CryptoService = CryptoService;
const cryptoService = new CryptoService();
exports.default = cryptoService;
