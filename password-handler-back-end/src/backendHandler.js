const AES = require('./crypto/aes');
const Hash = require('./crypto/hash');
const PasswordGenerator = require('./passwordGenerator');
const TokenGenerator = require('./tokenGenerator');
const fs = require('fs');
const MySQL = require('mysql');
const DataBaseQueries = require('./DataBaseQueries');
const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
require('dotenv').config();


const ServerErrors = require('./errors');
const { InvalidToken } = require('./errors');

class BackEndManager {
    constructor() {
        this.config = JSON.parse(fs.readFileSync("./src/config.json"));
        let getConn = () => {
            var conn = MySQL.createConnection({
                host: this.config["databaseConnection"]["host"],
                user: this.config["databaseConnection"]["user"],
                password: this.config["databaseConnection"]["password"],
                database: this.config["databaseConnection"]["database"]
            });
            conn.connect((err) => {
                if (err) {
                    console.log(err);
                    console.log("Can't connect to the database!");
                    process.exit(1);
                }
                console.log("Connected to the database!");
            });
            return conn;

        } 
        this.dbConn = getConn();

    }

    addUser(uname, email, masterpwd, userIP, callback) {

        let key = AES.generateKey();
        let ivKey = AES.generateIv();

        let firstSalt = Hash.generateSalt();
        let secondSalt = Hash.generateSalt();

        let hashed_masterpwd = Hash.hashPlainText(masterpwd, firstSalt);

        let encryptedKey = AES.encryptData(key, hashed_masterpwd, ivKey);
        let hashedhashed_masterpwd = Hash.hashPlainText(hashed_masterpwd, secondSalt);
        console.log("UNAME addUser() " + uname);

        try {
            DataBaseQueries.addUser(this.dbConn, uname, email, hashedhashed_masterpwd, firstSalt, secondSalt, encryptedKey, ivKey, (result) => {
                if (result instanceof ServerErrors.ServerError) {
                    callback(result);
                    return;
                }
                DataBaseQueries.addIP(this.dbConn, uname, userIP, (result) => {
                    if (result instanceof ServerErrors.ServerError) {
                        callback(result);
                        return;
                    }
                    callback(true);
                });
            });

        }
        catch (error) {
            callback(false);
        }
    }

    addIPtoDB(uname, emailToken, userIP, callback) {
        // let userIP = jsonData["userIP"];
        // let token = jsonData["token"];
        console.log("token: " + emailToken);
        console.log("ip: " + userIP);
        this.verifyEmailToken(uname, emailToken, (result) => {
            console.log("tokenDb: " + result);

            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result !== true) {
                callback(new ServerErrors.InternalServerError());
                return;
            }
            DataBaseQueries.addIP(this.dbConn, uname, userIP, (result) => {
                if (result === true) {
                    callback(true)
                } else {
                    callback(false)
                }
            });
        });
    }

    removeUser(uname, token, admin_uname, admin_token, callback) {
        if (admin_uname && admin_token) {
            this.verifyAdmin(admin_uname, admin_token, (result) => {
                if (result !== true) {
                    callback(result);
                    return;
                }

                DataBaseQueries.removeUser(this.dbConn, uname, (result) => {
                    callback(result);
                });
            });
        }
        else {
            this.verifyUser(uname, token, (result) => {
                if (result instanceof ServerErrors.ServerError) {
                    callback(result);
                    return;
                }
                if (result !== true) {
                    callback(new ServerErrors.InternalServerError());
                    return;
                }
    
                DataBaseQueries.removeUser(this.dbConn, uname, (result) => {
                    callback(result);
                });
    
            });

        }
    }

    getUserInfo(uname, token, callback) {
        this.verifyUser(uname, token, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result !== true) {
                callback(new ServerErrors.InternalServerError());
                return;
            }

            DataBaseQueries.getEmailFromUname(this.dbConn, uname, (result) => {
                if (result instanceof ServerErrors.ServerError) {
                    callback(result);
                    return;
                }
                if (result == null) {
                    callback(new ServerErrors.NoRowsEffectedInDb());
                    return;
                }
                let userInfo = {
                    "uname": uname,
                    "email": result
                };
                callback(userInfo);
            });

        });
    }

    getUsers(admin_uname, admin_token, callback) {
        this.verifyAdmin(admin_uname, admin_token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }

            DataBaseQueries.getAllUsers(this.dbConn, (result) => {
                callback(result);
            });

        });
    }

    verifyUser(uname, token, callback) {
        DataBaseQueries.getUserToken(this.dbConn, uname, (result) => {
            console.log(result);
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result == null) {
                callback(new ServerErrors.InvalidToken());
                return;
            }
            if (result !== token) {
                callback(new ServerErrors.InvalidToken());
                return;
            }
            callback(true);
        });
    }

    verifyEmailToken(uname, emailToken, callback) {
        DataBaseQueries.getUserEmailToken(this.dbConn, uname, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result == null) {
                callback(new ServerErrors.InvalidToken());
                return;
            }
            if (result !== emailToken) {
                callback(new ServerErrors.InvalidToken());
                return;
            }
            callback(true);
        });
    }

    loginUser(identification, masterpwd, userIP, callback) {
        // let decryptedData = jsonData;
        // let identification = decryptedData["identification"];
        // let masterpwd = decryptedData["password"];
        // let userIP = decryptedData["userIP"]   
        DataBaseQueries.getUnameFromIdentification(this.dbConn, identification, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }

            let uname = result;
            this.#authenticateUser(uname, masterpwd, (result) => {
                if (result !== true) {
                    callback(new ServerErrors.InvalidLogin());
                    return;
                }
                DataBaseQueries.checkIPofUser(this.dbConn, uname, userIP, (result) => {
                    if (result) {
                        this.#addNewToken(uname, (token) => {
                            if (token === null) {
                                callback(new ServerErrors.InternalServerError());
                                return;
                            }
                            callback(token);
                        })
                    } else {
                        DataBaseQueries.getEmailFromUname(this.dbConn, uname, (email) => {
                            this.#addNewEmailToken(uname, (token) => {
                                if (token === null) {
                                    callback(new ServerErrors.InternalServerError());
                                    return;
                                }
                                let html = '<p>A login in a new location have been detected, kindly use this <a href="https://'+ this.config['frontendSettings']['host'] + ':' + this.config['frontendSettings']['port'] + '/passwordhandler/confirmIP?uname=' + uname + '&token=' + token + '&ip=' + userIP + '">link</a> to verify the login.</p>'
                                this.sendMail(email, 'New login location detected', '', html, callback);
                                callback(new ServerErrors.EmailConformationNeeded())
                            });
                        });
                    }
                });




            });
        });

    }

    cancelUserToken(uname, token, callback) {
        this.verifyUser(uname, token, (result) => {
            console.log(result);
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result !== true) {
                callback(new ServerErrors.InternalServerError());
                return;
            }

            DataBaseQueries.cancelUserToken(this.dbConn, uname, (result) => {
                callback(result);
            });
        });
    }

    #addNewToken(uname, callback) {
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

    getAllPasswords(uname, token, callback) {
        // let decryptedData = jsonData;
        // let token = decryptedData["token"];
        // console.log("token " + token);
        this.verifyUser(uname, token, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result !== true) {
                callback(new ServerErrors.InternalServerError());
                return;
            }

            DataBaseQueries.getAllWebsitePasswords(this.dbConn, uname, (result) => {
                callback(result);
            });
        });


    }

    readUserName(identification, callback) {
        DataBaseQueries.getUnameFromIdentification(this.dbConn, identification, (result) => {
            callback(result);
        });
    }

    changeMasterPassword(uname, token, masterpwd, new_masterpwd, callback) {
        // let decryptedData = jsonData;
        // let token = decryptedData["token"];
        // let masterpwd = decryptedData["password"];
        // let new_masterpwd = decryptedData["newPassword"];

        this.verifyUser(uname, token, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result !== true) {
                callback(new ServerErrors.InternalServerError());
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

    changeUname(uname, new_uname, token, callback) {
        // let decryptedData = jsonData;
        // let token = decryptedData["token"];
        // let new_uname = decryptedData["new_uname"];

        this.verifyUser(uname, token, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result !== true) {
                callback(new ServerErrors.InternalServerError());
                return;
            }

            DataBaseQueries.changeUname(this.dbConn, uname, new_uname, (result) => {
                callback(result);
            })
        });
    }

    requestEmailChange(uname, token, new_email, callback) {
        // let decryptedData = jsonData;
        // let token = decryptedData["token"];
        // let new_email = decryptedData["new_email"];
        this.verifyUser(uname, token, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result !== true) {
                callback(new ServerErrors.InternalServerError());
                return;
            }

            this.#verifyEmail(uname, new_email, (err) => {
                if (err) {
                    callback(false);
                    return;
                }
                callback(true);


            });

        })
    }

    updateUser(uname, new_uname, new_email, password, new_password, token, callback) {
        this.verifyUser(uname, token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }
            this.#authenticateUser(uname, password, (authentication_result, dbUname, key) => {
                DataBaseQueries.getColumsForEncryptingPassword(this.dbConn, uname, (columns) => {
                    if (columns === null) {
                        callback(new ServerErrors.InternalServerError());
                        return;
                    }
                    console.log("UPDATE");
                    DataBaseQueries.getEmailFromUname(this.dbConn, uname, (result) => {
                        if (result instanceof ServerErrors.ServerError) {
                            callback(result);
                            return;
                        }
                        let email = result;
                        DataBaseQueries.getUserPwdForAuthentication(this.dbConn, uname, (result) => {
                            if (result === false) {
                                callback(new ServerErrors.InternalServerError());
                                return;
                            }
    
                            let hashedhashed_masterpwd = result;
                            let firstSalt = columns["salt_1"];
                            let secondSalt = columns["salt_2"];
                            let encrypted_key = columns["encrypted_key"];
    
                            if (!new_uname) {
                                new_uname = uname;
                            }
                            if (!new_email) {
                                new_email = email;
                            }
        
                            let new_hashedhashed_masterpwd;
                            let new_salt_1;
                            let new_salt_2;
                            let new_encrypted_key;
                            if (!new_password || !password) {
                                new_hashedhashed_masterpwd = hashedhashed_masterpwd;
                                new_salt_1 = firstSalt;
                                new_salt_2 = secondSalt;
                                new_encrypted_key = encrypted_key;
                            }
                            else if (authentication_result !== true) {
                                callback(new ServerErrors.InvalidLogin());
                                return;
                            }
                            else {
                                let ivKey = columns["iv"];
                                new_salt_1 = Hash.generateSalt();
                                new_salt_2 = Hash.generateSalt();
            
                                let hashed_masterpwd = Hash.hashPlainText(new_password, new_salt_1);
            
                                new_encrypted_key = AES.encryptData(key, hashed_masterpwd, ivKey);
                                new_hashedhashed_masterpwd = Hash.hashPlainText(hashed_masterpwd, new_salt_2);

                            }
                            DataBaseQueries.updateUser(this.dbConn, uname, new_uname, new_email, new_hashedhashed_masterpwd, new_salt_1, new_salt_2, new_encrypted_key, (result) => {
                                callback(result);
                                return;
                            });
    
                        });
                    });
                });
            });
        });
    }

    uploadPFP(uname, token, callback) {
        this.verifyUser(uname, token, (result) => {
            console.log(result);
            if (result != true) {
                callback(result);
                return;
            }
            DataBaseQueries.getPFPID(this.dbConn, uname, (result) => {
                console.log(result);


                if (result instanceof ServerErrors.ServerError) {
                    callback(result);
                    return;
                }
                let pfpid = result;
                DataBaseQueries.addPFPURL(this.dbConn, uname, pfpid, (result) => {
                    console.log(result);
                    if (result !== true) {
                        callback(result);
                        return;
                    }

                    let config = JSON.parse(fs.readFileSync("./src/config.json"));
                    console.log("dis is pfpid once again: " + pfpid);
                    config["databaseConnection"]["host"];
                    const region = config["s3Config"]["region"];
                    const bucketName = config["s3Config"]["bucketName"];
                    const accessKeyId = process.env.AWS_ACCESS_KEY;

                    const secretAccessKey = process.env.AWS_ACCESS_KEY_SECRET;

                    const s3 = new aws.S3({
                        region,
                        accessKeyId,
                        secretAccessKey,
                        signatureVersion: 'v4'

                    });

                    const imageName = pfpid;
                    const params = ({
                        Bucket: bucketName,
                        Key: imageName
                    });

                    const uploadURL = s3.getSignedUrlPromise('putObject', params)
                        .then((url) => {
                                this.getPFP(uname, token, (result) => {
                                    if (result instanceof ServerErrors.ServerError) {
                                        callback(result);
                                        return;
                                    }
                                    let jsonObjet = {
                                        pfp: url,
                                        pfpURL: result
                                    }
                                    callback(jsonObjet);

                                })
                            }
                        )
                        .catch(
                            () => {
                                callback(new ServerErrors.InternalServerError());

                            }
                        )

                })

            })
        });

    }

    getPFP(uname, token, callback) {
        this.verifyUser(uname, token, (result) => {
            if (result != true) {
                callback(result);
                return;
            }
        
            DataBaseQueries.getPFPURL(this.dbConn, uname, (result) => {
                callback(result);
    
            });
        });

    }

    #verifyEmail(uname, email, callback) {
        this.#addNewEmailToken(uname, (email_token) => {
            let html = '<p>You must confirm your email, kindly use this <a href="https://'+ this.config['frontendSettings']['host'] + ':' + this.config['frontendSettings']['port'] + '/verifyEmail?uname=' + uname + '&email_token=' + email_token + '&email=' + email + '">link</a> to verify the your email.</p>'
            this.sendMail(email, 'New email detected', '', html, callback);
        });
    }

    readPassword(masterpwd, website_url, website_uname, uname, token, callback) {
        // let decryptedData = jsonData;
        // let token = decryptedData["token"];
        // let masterpwd = decryptedData["password"];
        // let website_url = decryptedData["website_url"];
        // let website_uname = decryptedData["website_uname"];
        this.verifyUser(uname, token, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result !== true) {
                callback(new ServerErrors.InternalServerError());
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

    addPassword(masterpwd, website_url, website_uname, uname, token, callback) {
        // let decryptedData = jsonData;
        // let token = decryptedData["token"];
        // let masterpwd = decryptedData["password"];
        // let website_url = decryptedData["website_url"];
        // let website_uname = decryptedData["website_uname"];

        this.verifyUser(uname, token, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result !== true) {
                callback(new ServerErrors.InternalServerError());
                return;
            }

            this.#authenticateUser(uname, masterpwd, (result, uname, key) => {
                if (result !== true) {
                    callback(new ServerErrors.WrongMasterPassword());
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
                DataBaseQueries.changeUserToken(this.dbConn, jsonData["email"], token, (result) => {
                    if (result) {
                        let html = '<p>You requested for reset password, kindly use this <a href="https://'+ this.config['frontendSettings']['host'] + ':' + this.config['frontendSettings']['port'] + '/passwordhandler/reset-password?token=' + token + '">link</a> to reset your password</p>'
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
            service: this.config["mailConfig"]["service"],
            auth: {
                user: this.config["mailConfig"]["mail"],
                pass: process.env.EMIAL_HOST_PASSWORD
            }
        });

        var mailOptions = {
            from: this.config["mailConfig"]["mail"],
            to: email,
            subject: subject,
            text: msg,
            html: html
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                callback(error);
            } else {
                console.log('Email sent :' + info.response);
            }
        })
    }




    //-------ADMIN--------

    #verifySuperAdmin(super_admin_uname, super_admin_token, callback) {
        this.verifyAdmin(super_admin_uname, super_admin_token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }

            DataBaseQueries.isSuperAdmin(this.dbConn, super_admin_uname, (result) => {
                callback(result);

            })
        });
    }

    #addNewEmailTokenAdmin(uname, callback) {
        let newToken = TokenGenerator.generateToken(20, true);
        DataBaseQueries.changeUserEmailTokenAdmin(this.dbConn, uname, newToken, (result) => {
            if (result) {
                callback(newToken);
            }
            else {
                callback(new ServerErrors.InternalServerError());
            }

        })
    }

    verifyAdmin(uname, token, callback) {
        DataBaseQueries.getAdminToken(this.dbConn, uname, (result) => {
            console.log(result);
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result == null) {
                callback(new ServerErrors.InvalidToken());
                return;
            }
            if (result !== token) {
                callback(new ServerErrors.InvalidToken());
                return;
            }
            callback(true);
        });
    }

    verifyEmailTokenAdmin(uname, emailToken, callback) {
        DataBaseQueries.getAdminEmailToken(this.dbConn, uname, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }
            if (result == null) {
                callback(new ServerErrors.InvalidToken());
                return;
            }
            if (result !== emailToken) {
                callback(new ServerErrors.InvalidToken());
                return;
            }

            DataBaseQueries.cancelAdminEmailToken(this.dbConn, uname, (result) => {
                if (result) {
                    console.log("Admin email token has been canceled");

                }
                else {
                    console.log("Admin email token could not be canceled");
                }
            });
            callback(true);
        });
    }

    #addNewTokenAdmin(uname, callback) {
        let newToken = TokenGenerator.generateToken(20, true);
        DataBaseQueries.changeAdminToken(this.dbConn, uname, newToken, (result) => {
            if (result) {
                callback(newToken);
            }
            else {
                callback(new ServerErrors.InternalServerError());
            }

        })
    }

    #authenticateAdmin(uname, masterpwd, callback) {
        DataBaseQueries.getAdminSalt(this.dbConn, uname, (result) => {
            if (result instanceof ServerErrors.ServerError) {
                callback(result);
                return;
            }

            let salt = result;
            let hashedPassword = Hash.hashPlainText(masterpwd, salt);

            DataBaseQueries.getAdminPwdForAuthentication(this.dbConn, uname, (result) => {
                if (result instanceof ServerErrors.ServerError) {
                    callback(result);
                    return;
                }

                let hashedPasswordDb = result;
                if (hashedPasswordDb.toString() === hashedPassword.toString()) {
                    callback(true);
                }
                else {
                    callback(false);
                    return;
                }
            });
        });

    }

    createAdmin(super_admin_uname, super_admin_token, uname, email, callback) {
        this.#verifySuperAdmin(super_admin_uname, super_admin_token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }

            DataBaseQueries.addAdmin(this.dbConn, uname, email, (result) => {
                if (result !== true) {
                    callback(result);
                    return;
                }

                this.#addNewEmailTokenAdmin(uname, (result) => {
                    if (result instanceof ServerErrors.ServerError) {
                        callback(result);
                        return;
                    }
                    let html = '<p>A new admin account has been created, kindly use this <a href="https://'+ this.config['frontendSettings']['host'] + ':' + this.config['frontendSettings']['port'] + '/passwordhandler/admin/complete?uname=' + uname + '&token=' + result + '">link</a> to complete the account.</p>'
                    this.sendMail(email, 'New admin created', '', html, callback);
                    callback(new ServerErrors.EmailConformationNeeded())
                });

            });

        });
    }

    addAdminPassword(uname, email_token, password, callback) {
        this.verifyEmailTokenAdmin(uname, email_token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }

            let salt = Hash.generateSalt();
            let hashedPassword = Hash.hashPlainText(password, salt);
            DataBaseQueries.addAdminPassword(this.dbConn, uname, hashedPassword, salt, (result) => {
                if (result !== true) {
                    callback(result);
                    return;
                }

                callback(true);
            })
        })
    }

    loginAdmin(uname, password, ip, callback) {
        this.#authenticateAdmin(uname, password, (result) => {
            if (result !== true) {
                callback(new ServerErrors.InvalidLogin());
                return;
            }

            DataBaseQueries.checkIpAdmin(this.dbConn, uname, ip, (result) => {
                if (result) {
                    this.#addNewTokenAdmin(uname, (result) => {
                        if (result instanceof ServerErrors.ServerError) {
                            callback(result);
                            return;
                        }

                        callback(result);
                        return;
                    });
                } else {
                    DataBaseQueries.getEmailFromUnameAdmin(this.dbConn, uname, (result) => {
                        if (result instanceof ServerErrors.ServerError) {
                            callback(result);
                            return;
                        }

                        let email = result;
                        this.#addNewEmailTokenAdmin(uname, (result) => {
                            if (result instanceof ServerErrors.ServerError) {
                                callback(result);
                                return;
                            }

                            let token = result;
                            let html = '<p>A login in a new location have been detected, kindly use this <a href="https://'+ this.config['frontendSettings']['host'] + ':' + this.config['frontendSettings']['port'] + '/passwordhandler/confirmIP?uname=' + uname + '&admin-token=' + token + '&ip=' + ip + '">link</a> to verify the login.</p>'
                            this.sendMail(email, 'New login location detected', '', html, callback);
                            callback(new ServerErrors.EmailConformationNeeded())
                        });
                    });
                }
            });

        });
    }

    cancelAdminToken(uname, token, callback) {
        this.verifyAdmin(uname, token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }

            DataBaseQueries.cancelAdminToken(this.dbConn, uname, (result) => {
                callback(result);
            });
        });
    }

    confirmIpAdmin(uname, email_token, ip, callback) {
        this.verifyEmailTokenAdmin(uname, email_token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }

            DataBaseQueries.addIPAdmin(this.dbConn, uname, ip, (result) => {
                if (result !== true) {
                    callback(result);
                    return;
                }

                callback(result);

            });
        });
    }

    getAdminInfo(uname, token, callback) {
        this.verifyAdmin(uname, token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }

            DataBaseQueries.getEmailFromUnameAdmin(this.dbConn, uname, (result) => {
                if (result instanceof ServerErrors.ServerError) {
                    callback(result);
                    return;
                }

                let email = result;

                DataBaseQueries.isSuperAdmin(this.dbConn, uname, (result) => {
                    if (result instanceof ServerErrors.ServerError) {
                        callback(result);
                        return;
                    }

                    let isSuperAdmin = result;

                    let adminInfo = {
                        "uname": uname,
                        "email": email,
                        "isSuperAdmin": isSuperAdmin
                    };
                    callback(adminInfo);
                });

            });

        });
    }

    updateAdmin(uname, new_uname, new_email, password, new_password, token, callback) {

        this.verifyAdmin(uname, token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }
            this.#authenticateAdmin(uname, password, (authentication_result) => {
                DataBaseQueries.getAttributesForUpdateAdmin(this.dbConn, uname, (result) => {
                    if (result instanceof ServerErrors.ServerError) {
                        callback(result);
                        return;
                    }
                    console.log("auth " + authentication_result);

                    let email;
                    let hashed_pwd;
                    let salt;
                    try {
                        email = result["email"];
                        hashed_pwd = result["hashed_pwd"];
                        salt = result["salt"];
                    }
                    catch (err) {
                        callback(new ServerErrors.InternalServerError());
                        return;
                    }
                    if (!new_uname) {
                        new_uname = uname;
                    }
                    if (!new_email) {
                        new_email = email;
                    }

                    let new_hashed_pwd;
                    if (!new_password || !password) {
                        new_hashed_pwd = hashed_pwd;
                    }
                    else if (authentication_result !== true) {
                        callback(new ServerErrors.InvalidLogin());
                        return;
                    }
                    else {
                        new_hashed_pwd = Hash.hashPlainText(new_password, salt);
                    }
                    console.log(new_uname);
                    console.log(new_email);
                    console.log(new_hashed_pwd);

                    DataBaseQueries.updateAdmin(this.dbConn, uname, new_uname, new_email, new_hashed_pwd, (result) => {
                        callback(result);
                    });

                });

            });
        });
    }

    deleteAdmin(uname, admin_token, super_admin_uname, super_admin_token, callback) {
        if (super_admin_uname && super_admin_token) {
            this.#verifySuperAdmin(super_admin_uname, super_admin_token, (result) => {
                if (result !== true) {
                    callback(result);
                    return;
                }

                DataBaseQueries.removeAdmin(this.dbConn, uname, (result) => {
                    callback(result);
                });
            });
        }
        else {
            this.verifyAdmin(uname, admin_token, (result) => {
                if (result !== true) {
                    callback(result);
                    return;
                }

                DataBaseQueries.removeAdmin(this.dbConn, uname, (result) => {
                    callback(result);
                });
            });
        }
    }

    getAdmins(super_admin_uname, super_admin_token, callback) {
        this.#verifySuperAdmin(super_admin_uname, super_admin_token, (result) => {
            if (result !== true) {
                callback(result);
                return;
            }

            DataBaseQueries.getAllAdmins(this.dbConn, (result) => {
                if (result instanceof ServerErrors.ServerError) {
                    callback(result);
                    return;
                }

                this.#allAdminsAddIsSuperAdmin(0, result, (result) => {
                    callback(result);

                })
            });

        });
    }

    #allAdminsAddIsSuperAdmin(index, admins, callback) {
        DataBaseQueries.isSuperAdmin(this.dbConn, admins[index]["uname"], (result) => {
            if (result instanceof ServerErrors.ServerError) {
                reject();
                return;
            }

            admins[index]["isSuperAdmin"] = result;
            console.log(admins);
            let nextIndex = index + 1;
            if (nextIndex >= admins.length) {
                callback(admins);
                return;
            }
            this.#allAdminsAddIsSuperAdmin(nextIndex, admins, callback);
        });
    }

    //--------------------

}

module.exports = new BackEndManager();