import CryptoTS = require('crypto-ts');

export class CryptoService {

    constructor () { }

    public encrypt(text: string) {
        return CryptoTS.AES.encrypt(text, 'secret key 123');
    }

    public decrypt(text: any) {
        const bytes  = CryptoTS.AES.decrypt(text.toString(), 'secret key 123');
        return bytes.toString(CryptoTS.enc.Utf8);
    }
    
}
const cryptoService = new CryptoService();
export default cryptoService;