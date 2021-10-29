"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crypto = void 0;
const crypto_1 = require("crypto");
class Crypto {
    static decode(hash, password) {
        let key = crypto_1.createDecipher('aes-128-cbc', password);
        let decodedString = key.update(hash, 'hex', 'utf8');
        decodedString += key.final('utf8');
        return decodedString;
    }
    static encode(text, password) {
        let key = crypto_1.createCipher('aes-128-cbc', password);
        let encodedString = key.update(text, 'utf8', 'hex');
        encodedString += key.final('hex');
        return encodedString;
    }
}
exports.Crypto = Crypto;
//# sourceMappingURL=Crypto.js.map