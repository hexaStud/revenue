import {createDecipher, createCipher} from "crypto";

export class Crypto {
    public static decode(hash: string, password: string): string {
        let key = createDecipher('aes-128-cbc', password);
        let decodedString = key.update(hash, 'hex', 'utf8')
        decodedString += key.final('utf8');
        return decodedString;
    }

    public static encode(text: string, password: string): string {
        let key = createCipher('aes-128-cbc', password);
        let encodedString = key.update(text, 'utf8', 'hex')
        encodedString += key.final('hex');
        return encodedString;
    }
}

