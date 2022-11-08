const { rsaEncryption } = require('./crypto/rsaEncryption');
const RsaEncryption = require('./crypto/rsaEncryption');
const fs = require('fs');
const MySQL = require('mysql');

class BackEndManager {
    constructor() {
        let config = JSON.parse(fs.readFileSync("./src/config.json"));
        this.dbConn = MySQL.createConnection({
            host: config["databaseConnection"]["host"],
            user: config["databaseConnection"]["user"],
            password: config["databaseConnection"]["password"],
            database: config["databaseConnection"]["database"]
        });
        this.dbConn.connect((err) => {
            if (err) {
                console.log("Can't connect to the database!");
                process.exit(1);
            }
            console.log("Connected to the database!");
        });
    }
    

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