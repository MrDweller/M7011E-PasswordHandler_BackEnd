const { rsaEncryption } = require('./crypto/rsaEncryption');
const RsaEncryption = require('./crypto/rsaEncryption');
const fs = require('fs');

class BackEndManager {
    

    generateServerKeys(){
        let rsaKeys = RsaEncryption.generateRSA();
        let publicKey = rsaKeys[RsaEncryption.PUBLIC_RSA_KEY_IDENTIFIER];
        let privateKey = rsaKeys[RsaEncryption.PRIVATE_RSA_KEY_IDENTIFIER];
        let contents = JSON.stringify(rsaKeys);
        
        fs.writeFileSync('./publicServerKey', publicKey, err => {
        if (err) {
            console.error(err);
        }
        });
        fs.writeFileSync('./privateServerKey', privateKey, err => {
            if (err) {
                console.error(err);
            }
        });

    }

    getPublicServerKey(){
        return fs.readFileSync('./publicServerKey');
    }
}

module.exports = BackEndManager;