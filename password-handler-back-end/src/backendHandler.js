const { rsaEncryption } = require('./crypto/rsaEncryption');
const RsaEncryption = require('./crypto/rsaEncryption');
const AES = require('./crypto/aes');
const Hash = require('./crypto/hash');
const PasswordGenerator = require('./passwordGenerator');
const TokenGenerator = require('./tokenGenerator');
const fs = require('fs');
const MySQL = require('mysql');
const DataBaseQueries = require('./DataBaseQueries');
const { response } = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const EmailConformationNeeded = require('./errors');

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

    // #readPrivateRsaKey() {
    //     return fs.readFileSync('./privateServerKey');
    // }

    // generateServerKeys() {
    //     let rsaKeys = RsaEncryption.generateRSA();
    //     let publicKey = rsaKeys[RsaEncryption.PUBLIC_RSA_KEY_IDENTIFIER];
    //     let privateKey = rsaKeys[RsaEncryption.PRIVATE_RSA_KEY_IDENTIFIER];
    //     fs.writeFileSync('./publicServerKey', publicKey, err => {
    //         if (err) {
    //             console.error(err);
    //         }
    //     });
    //     fs.writeFileSync('./privateServerKey', privateKey, err => {
    //         if (err) {
    //             console.error(err);
    //         }
    //     });

    // }

    // getPublicServerKey() {
    //     return fs.readFileSync('./publicServerKey');
    // }

    addUser(uname, email, masterpwd, userIP, callback) {
        // let secretData = jsonData["secretData"];
        // let publicData = jsonData["publicData"];

        // let privateRsaKey = this.#readPrivateRsaKey();
        // let decryptedData = RsaEncryption.rsaDecryptJsonObject(privateRsaKey, secretData);

        // let decryptedData = jsonData;

        // let uname = decryptedData["uname"];
        // let email = decryptedData["email"];
        // let masterpwd = decryptedData["password"];
        // let userIP = decryptedData["userIP"]

        let key = AES.generateKey();
        let ivKey = AES.generateIv();

        let firstSalt = Hash.generateSalt();
        let secondSalt = Hash.generateSalt();

        let hashed_masterpwd = Hash.hashPlainText(masterpwd, firstSalt);

        let encryptedKey = AES.encryptData(key, hashed_masterpwd, ivKey);
        let hashedhashed_masterpwd = Hash.hashPlainText(hashed_masterpwd, secondSalt);
        console.log("UNAME addUser() " + uname);

        try {
            DataBaseQueries.addUser(this.dbConn, uname, email, hashedhashed_masterpwd, firstSalt, secondSalt, encryptedKey, ivKey, (status) => {
                if(status){
                    DataBaseQueries.addIP(this.dbConn, uname, userIP, (status) => {
                        if(status){
                            callback(true);
                        }else{
                            callback(false);
                        }
                    })
                }
                else {
                    callback(false);
                }
            });

        }
        catch (error) {
            callback(false);
        }
    }

    addIPtoDB(uname, token, userIP, callback){
        // let userIP = jsonData["userIP"];
        // let token = jsonData["token"];
        console.log("token: " + token);
        console.log("ip: " + userIP);
        DataBaseQueries.getUserEmailToken(this.dbConn, uname, (err, tokenDb) => {
            console.log("tokenDb: " + tokenDb);
            
            if (err) {
                console.log("error " + err);
                callback(false);
                return;
            }
            if (tokenDb === null)
            {
                callback(false);
                return;
            }
            if (token !== tokenDb) {
                callback(false);
                return;
            }

            DataBaseQueries.addIP(this.dbConn, uname, userIP, (result) => {
                if(result){
                    callback(true)
                }else{
                    callback(false)
                }
            });
        });
    }

    loginUser(identification, masterpwd, userIP, callback) {
        // let decryptedData = jsonData;
        // let identification = decryptedData["identification"];
        // let masterpwd = decryptedData["password"];
        // let userIP = decryptedData["userIP"]   
        DataBaseQueries.getUnameFromIdentification(this.dbConn, identification, (uname) => {
            if (uname === null) {
                callback(null);
                return;
            }

            this.#authenticateUser(uname, masterpwd, (result) => {
                if (result !== true) {
                    callback(null);
                    return;
                }
                DataBaseQueries.checkIPofUser(this.dbConn, uname, userIP, (result) => {
                    if (result) {
                        this.#addNewToken(uname, (token) => {
                            if (token === null) {
                                callback(null);
                                return;
                            }
                            callback(token);
                        })
                    } else {
                        DataBaseQueries.getEmailFromUname(this.dbConn, uname, (email) => {
                            this.#addNewEmailToken(uname, (token) => {
                                if (token === null) {
                                    callback(null);
                                    return;
                                }
                                let html = '<p>A login in a new location have been detected, kindly use this <a href="http://localhost:3000/passwordhandler/confirmIP?token=' + token + '&ip=' + userIP + '">link</a> to verify the login.</p>'
                                this.sendMail(email,'New login location detected','' , html, callback);
                            });
                            callback(new EmailConformationNeeded())
                        });
                    }
                });




            });
        });

    }

    #addNewToken(uname, callback){
        let newToken = TokenGenerator.generateToken(20, true);
        DataBaseQueries.changeUserToken(this.dbConn, uname, newToken, (result) => {
            if (result) {
                callback(newToken);
            }
            else {
                this.#addNewToken(uname, callback);
            }

        })
    }

    #addNewEmailToken(uname, callback) {
        let newToken = TokenGenerator.generateToken(20, true);
        DataBaseQueries.changeUserEmailToken(this.dbConn, uname, newToken, (result) => {
            if (result) {
                callback(newToken);
            }
            else {
                this.#addNewToken(uname, callback);
            }

        })
    }

    getAllPasswords(jsonData, callback) {
        let decryptedData = jsonData;
        let token = decryptedData["token"];
        console.log("token " + token);
        DataBaseQueries.getUnameFromToken(this.dbConn, token, (err, uname) => {

            if (err) {
                console.log("error" + err);
                callback(err);
                return;
            }
            if (uname === null) {
                callback(null);
                return;
            }
            DataBaseQueries.getAllWebsitePasswords(this.dbConn, uname, (result) => {
                if (result === null) {
                    callback(null);
                    return;
                }
                console.log(result);
                callback(result);
            });

        });

    }

    readUserName(jsonData, callback) {
        let decryptedData = jsonData;
        let token = decryptedData["token"];

        DataBaseQueries.getUnameFromToken(this.dbConn, token, (error, uname) => {
            if (error) {
                console.log("error " + error);
                callback(error);
                return;
            }

            if (uname === null) {
                callback(null);
                return;
            }

            callback(uname);
        });
    }

    changeMasterPassword(jsonData, callback) {
        let decryptedData = jsonData;
        let token = decryptedData["token"];
        let masterpwd = decryptedData["password"];
        let new_masterpwd = decryptedData["newPassword"];

        DataBaseQueries.getUnameFromToken(this.dbConn, token, (error, uname) => {
            console.log(uname + ": " + masterpwd);
            if (error) {
                console.log("error" + error);
                callback(error);
                return;
            }

            if (uname === null) {
                callback(null);
                return;
            }
            this.#authenticateUser(uname, masterpwd, (result, uname, key) => {
                if (result !== true) {
                    callback(null);
                    return;
                }
                DataBaseQueries.getColumsForEncryptingPassword(this.dbConn, uname, (columns) => {
                    if (columns === null) {
                        callback(false);
                        return;
                    }
                    let ivKey = columns["iv"];

                    let firstSalt = Hash.generateSalt();
                    let secondSalt = Hash.generateSalt();

                    let hashed_masterpwd = Hash.hashPlainText(new_masterpwd, firstSalt);

                    let encryptedKey = AES.encryptData(key, hashed_masterpwd, ivKey);
                    let hashedhashed_masterpwd = Hash.hashPlainText(hashed_masterpwd, secondSalt);
                    DataBaseQueries.changePasswordUser(this.dbConn, uname, hashedhashed_masterpwd, firstSalt, secondSalt, encryptedKey, (result) => {
                        if (result === null) {
                            callback(false);
                            return;
                        }
                        callback(true);
                    });
                });
            });

        });

    }

    changeUname(jsonData, callback) {
        let decryptedData = jsonData;
        let token = decryptedData["token"];
        let new_uname = decryptedData["new_uname"];

        DataBaseQueries.getUnameFromToken(this.dbConn, token, (err, uname) => {
            if (err) {
                console.log("error" + err);
                callback(err);
                return;
            }
            if (uname === null) {
                callback(null);
                return;
            }
            DataBaseQueries.changeUname(this.dbConn, uname, new_uname, (result) => {
                callback(result);
            })
        });
    }

    requestEmailChange(jsonData, callback) {
        let decryptedData = jsonData;
        let token = decryptedData["token"];
        let new_email = decryptedData["new_email"];
        DataBaseQueries.getUnameFromToken(this.dbConn, token, (err, uname) => {
            if (err) {
                console.log("error" + err);
                callback(err);
                return;
            }
            if (uname === null) {
                callback(null);
                return;
            }
            this.#verifyEmail(uname, new_email, (err) => {
                if(err) {
                    callback(false);
                    return;
                }
                callback(true);
                

            });

        })
        // TODO: Generate a token and send an email conformation request
        //this.sendMail(new_email, )
    }

    #verifyEmail(uname, email, callback) {
        this.#addNewEmailToken(uname, (email_token) => {
            let html = '<p>You must confirm your email, kindly use this <a href="http://localhost:3000/verifyEmail?email_token=' + email_token + '">link</a> to verify the your email.</p>'
            this.sendMail(email, 'New email detected', '', html, callback);
        });
    }

    readPassword(jsonData, callback) {
        let decryptedData = jsonData;
        let token = decryptedData["token"];
        let masterpwd = decryptedData["password"];
        let website_url = decryptedData["website_url"];
        let website_uname = decryptedData["website_uname"];

        DataBaseQueries.getUnameFromToken(this.dbConn, token, (error, uname) => {
            console.log(uname + ": " + masterpwd);
            if (error) {
                console.log("error" + error);
                callback(error);
                return;
            }

            if (uname === null) {
                callback(null);
                return;
            }
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

        });

    }

    addPassword(jsonData, callback) {
        let decryptedData = jsonData;
        let token = decryptedData["token"];
        let masterpwd = decryptedData["password"];
        let website_url = decryptedData["website_url"];
        let website_uname = decryptedData["website_uname"];

        DataBaseQueries.getUnameFromToken(this.dbConn, token, (error, uname) => {
            if (error) {
                console.log("error" + error);
                callback(error);
                return;
            }

            if (uname === null) {
                callback(null);
                return;
            }

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

        });


    }

    #authenticateUser(uname, masterpwd, callback) {
        DataBaseQueries.getColumsForEncryptingPassword(this.dbConn, uname, (columns) => {
            if (columns === null) {
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
                if (db_hashedhashed_pwd === null) {
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


    resetPassword(jsonData, callback) {
        DataBaseQueries.getUnameFromIdentification(this.dbConn, jsonData["email"], (uname) => {
            if (uname === null) {
                callback(false);
            } else {
                //let token = crypto.randomBytes(20).toString('base64'); /DO NOT USE THIS
                DataBaseQueries.changeUserToken(this.dbConn, jsonData["email"], token, (result) => {
                    if (result) {
                        let html = '<p>You requested for reset password, kindly use this <a href="http://localhost:3000/passwordhandler/reset-password?token=' + token + '">link</a> to reset your password</p>'
                        this.sendMail(jsonData["email"], jsonData["subject"], jsonData["msg"], html, callback);
                    } else {
                        this.resetPassword(jsonData, callback);
                    }
                })

            }
        })
    }

    sendMail(email, subject, msg, html, callback) {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'pwordhandler@gmail.com',
                pass: 'gfyn jmue xwrm ihtz'
            }
        });

        var mailOptions = {
            from: 'pwordhandler@gmail.com',
            to: email,
            subject: subject,
            text: msg,
            html: html
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                callback(error)
            } else {
                console.log('Email sent :' + info.response);
            }
        })
    }

}

module.exports = new BackEndManager();