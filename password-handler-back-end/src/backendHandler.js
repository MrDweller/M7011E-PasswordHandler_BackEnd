const { rsaEncryption } = require('./crypto/rsaEncryption');
const RsaEncryption = require('./crypto/rsaEncryption');
const AES = require('./crypto/aes');
const Hash = require('./crypto/hash');
const fs = require('fs');
const MySQL = require('mysql');
const DataBaseQueries = require('./DataBaseQueries');
const { response } = require('express');

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

    #readPrivateRsaKey() {
        return fs.readFileSync('./privateServerKey');
    }

    generateServerKeys() {
        let rsaKeys = RsaEncryption.generateRSA();
        let publicKey = rsaKeys[RsaEncryption.PUBLIC_RSA_KEY_IDENTIFIER];
        let privateKey = rsaKeys[RsaEncryption.PRIVATE_RSA_KEY_IDENTIFIER];
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

    getPublicServerKey() {
        return fs.readFileSync('./publicServerKey');
    }

    addUser(jsonData, callback) {
        // let secretData = jsonData["secretData"];
        // let publicData = jsonData["publicData"];

        // let privateRsaKey = this.#readPrivateRsaKey();
        // let decryptedData = RsaEncryption.rsaDecryptJsonObject(privateRsaKey, secretData);

        let decryptedData = jsonData;

        let userName = decryptedData["uname"];
        let email = decryptedData["email"];
        let masterpwd = decryptedData["password"];

        let key = AES.generateKey();
        let ivKey = AES.generateIv();

        let firstSalt = Hash.generateSalt();
        let secondSalt = Hash.generateSalt();

        let hashed_masterpwd = Hash.hashPlainText(masterpwd, firstSalt);

        let encryptedKey = AES.encryptData(key, hashed_masterpwd, ivKey);        
        let hashedhashed_masterpwd = Hash.hashPlainText(hashed_masterpwd, secondSalt);
      
        DataBaseQueries.addUser(this.dbConn, userName, email, hashedhashed_masterpwd, firstSalt, secondSalt, encryptedKey, ivKey, callback);
    }

    authenticateUser(jsonData, callback) {
        let decryptedData = jsonData;
        let uname = decryptedData["uname"];
        let email = decryptedData["email"];
        let masterpwd = decryptedData["password"];

        if (uname === null) {
            DataBaseQueries.getUserSalts(this.dbConn, email, (result) => {
                console.log(result);
                let salts = result;
                let hashed_masterpwd = Hash.hashPlainText(masterpwd, salts[0]["salt_1"]);

                DataBaseQueries.getUserForLoginAuthentication(this.dbConn, email, (result2) => {
                    console.log(result2);
                    let db_hashedhashed_pwd = result2[0]["hashedhashed_masterpwd"];
                    let hashedhashed_masterpwd = Hash.hashPlainText(hashed_masterpwd, salts[0]["salt_2"]);
                    if (db_hashedhashed_pwd.toString() === hashedhashed_masterpwd.toString()) {
                        callback(true)
                    } else {
                        callback(false)
                    }
                })
            })
        } else {
            DataBaseQueries.getUserSalts(this.dbConn, uname, (result) => {
                let salts = result;
                let hashed_masterpwd = Hash.hashPlainText(masterpwd, salts[0]["salt_1"]);

                DataBaseQueries.getUserForLoginAuthentication(this.dbConn, uname, (result2) => {
                    let db_hashedhashed_pwd = result2[0]["hashedhashed_masterpwd"];
                    let hashedhashed_masterpwd = Hash.hashPlainText(hashed_masterpwd, salts[0]["salt_2"]);
                    if (db_hashedhashed_pwd.toString() === hashedhashed_masterpwd.toString()) {
                        callback(true)
                    } else {
                        callback(false)
                    }
                })

            })
        }











    }

    

}

module.exports = BackEndManager;