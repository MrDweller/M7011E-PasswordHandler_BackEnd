const crypto = require('crypto');

class AesEncryption {
    static #BLOCK_SIZE = 256;
    static #AES_ALGORITHM = 'aes-'+AesEncryption.#BLOCK_SIZE.toString()+'-cbc';

    static decryptData(encryptedData, key, iv) {
        const decipher = crypto.createDecipheriv(AesEncryption.#AES_ALGORITHM, key, iv);
        let decryptedData = Buffer.concat([decipher.update(encryptedData, 'hex'), decipher.final()]);
        return decryptedData;
    }

    static encryptData(decryptedData, key, iv) {
        const cipher = crypto.createCipheriv(AesEncryption.#AES_ALGORITHM, key, iv);
        let encryptedData = Buffer.concat([cipher.update(decryptedData), cipher.final()]);
        return encryptedData;
    }

    static generateKey() {
        return crypto.randomBytes(AesEncryption.#BLOCK_SIZE/8);
    }

    static generateIv() {
        return crypto.randomBytes(16);
    }
}

module.exports = AesEncryption;