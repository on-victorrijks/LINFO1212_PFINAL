// Imports
import crypto from "crypto";

// Constants
const algorithm = 'aes-256-ctr';
const key = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

export const encrypt = (text) => {
    /*
        DEF  : On encrypte le paramètre text
        PRE  : text (string)
        POST : string
    */
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
    const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);

    return encryptedText.toString('hex');
};

export const decrypt = (hash) => {
    /*
        DEF  : On décrypte le paramètre hash
        PRE  : hash (string)
        POST : string
    */
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));
    const decryptedText = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decryptedText.toString();
};

