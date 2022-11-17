const { rsaEncryption } = require('./crypto/rsaEncryption');
const RsaEncryption = require('./crypto/rsaEncryption');
const AES = require('./crypto/aes');
const Hash = require('./crypto/hash');
const PasswordGenerator = require('./passwordGenerator');
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
      
        try {
            DataBaseQueries.addUser(this.dbConn, userName, email, hashedhashed_masterpwd, firstSalt, secondSalt, encryptedKey, ivKey, callback);

        }
        catch (error) {
            callback(false);
        }
    }

    loginUser(jsonData, callback) {
        let decryptedData = jsonData;
        let identification = decryptedData["identification"];
        let masterpwd = decryptedData["password"];
        DataBaseQueries.getUnameFromIdentification(this.dbConn, identification, (uname) =>{
            if (uname === null) {
                callback(null);
                return;
            }

            this.#authenticateUser(uname, masterpwd, (result) => {
                if (result !== true) {
                    callback(null);
                    return;
                }
                callback(uname);
            });
        });

    }

    readPassword(jsonData, callback) {
        let decryptedData = jsonData;
        let uname = decryptedData["uname"];
        let masterpwd = decryptedData["password"];
        let website_url = decryptedData["website_url"];
        let website_uname = decryptedData["website_uname"];

        this.#authenticateUser(uname, masterpwd, (result, uname, key) => {
            if (result !== true) {
                callback(null);
                return;
            }
            DataBaseQueries.getWebsitePassword(this.dbConn, uname, website_url, website_uname, (result) => {
                if (result === null) {
                    callback(null);
                    return;
                }
                let password = AES.decryptData(result["encrypted_pwd"], key, result["iv"]);
                callback(password.toString());
            });
        });

    }

    addPassword(jsonData, callback) {
        let decryptedData = jsonData;
        let uname = decryptedData["uname"];
        let masterpwd = decryptedData["password"];
        let website_url = decryptedData["website_url"];
        let website_uname = decryptedData["website_uname"];

        this.#authenticateUser(uname, masterpwd, (result, uname, key) => {
            if (result !== true) {
                callback(false);
                return;
            }
            let iv = AES.generateIv();
            let password = PasswordGenerator.generatePassword(16, true, true);
            console.log(password);
            let encypted_pwd = AES.encryptData(password, key, iv);
            DataBaseQueries.addNewPassword(this.dbConn, uname, website_url, website_uname, encypted_pwd, iv, (result) => {
                callback(result);
            });
        });

       
    }

    #authenticateUser(uname, masterpwd, callback) {
        DataBaseQueries.getColumsForEncryptingPassword(this.dbConn, uname, (columns) => {
            if (columns === null)
            {
                callback(false);
                return;
            }
            let salts = {};
            salts["salt_1"] = columns["salt_1"];
            salts["salt_2"] = columns["salt_2"];
            let encrypted_key = columns["encrypted_key"];
            let hashed_masterpwd = Hash.hashPlainText(masterpwd, salts["salt_1"]);
            let iv = columns["iv"];
            let key = AES.decryptData(encrypted_key, hashed_masterpwd, iv);

            DataBaseQueries.getUserPwdForAuthentication(this.dbConn, uname, (db_hashedhashed_pwd) => {
                if (db_hashedhashed_pwd === null)
                {
                    callback(false);
                    return;
                }
                
                let hashedhashed_masterpwd = Hash.hashPlainText(hashed_masterpwd, salts["salt_2"]);
                if (db_hashedhashed_pwd.toString() === hashedhashed_masterpwd.toString()) {
                    callback(true, uname, key);
                } 
                else {
                    callback(false);
                    return;
                }
            });
        });

    }

}

module.exports = BackEndManager;