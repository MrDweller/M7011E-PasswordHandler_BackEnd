const crypto = require('crypto');

class RsaEncryption {
    static PUBLIC_RSA_KEY_IDENTIFIER = "publicRsaKey";
    static PRIVATE_RSA_KEY_IDENTIFIER = "privateRsaKey";

    static generateRSA() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            // The standard secure default length for RSA keys is 2048 bits
            modulusLength: 2048,
        });
        var rsaKeys = new Object();
        rsaKeys[RsaEncryption.PUBLIC_RSA_KEY_IDENTIFIER] = publicKey.export({
            type: "pkcs1",
            format: "pem",
        });
        rsaKeys[RsaEncryption.PRIVATE_RSA_KEY_IDENTIFIER] = privateKey.export({
            type: "pkcs1",
            format: "pem",
        })
    
        return rsaKeys;
    }

    static rsaEncryption(rsaPublicKey, plainText) {
        let encryptedData = crypto.publicEncrypt(
            {
                key: rsaPublicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(plainText)
        )
    
        return encryptedData;
    }
    
    static rsaDecryption(rsaPrivateKey, encryptedData) {
        let decryptedData = crypto.privateDecrypt(
            {
                key: rsaPrivateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            Buffer.from(encryptedData)
        )
    
        return decryptedData;
    }

    static rsaEncryptJsonObject(rsaPublicKey, jsonObject) {
        let encryptedJsonObject = {};
        for(var jsonKey in jsonObject){
            encryptedJsonObject[jsonKey] = RsaEncryption.rsaEncryption(rsaPublicKey, jsonObject[jsonKey]);
        }
        return encryptedJsonObject;
    }

    static rsaDecryptJsonObject(rsaPrivateKey, jsonObject) {
        let decryptedJsonObject = {};
        for(var jsonKey in jsonObject){
            decryptedJsonObject[jsonKey] = RsaEncryption.rsaDecryption(rsaPrivateKey, jsonObject[jsonKey]);
        }
        return decryptedJsonObject;
    }
}

module.exports = RsaEncryption;