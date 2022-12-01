const crypto = require('crypto');
class DataBaseQueries {
    static addUser(dbConn, uname, email, hashedhashed_masterpwd, salt_1, salt_2, encrypted_key, iv, callback) {
        var sql = "INSERT INTO `users` VALUES ? ";
        console.log("UNAME querie " + uname)
        var values = [
            [uname, email,
                hashedhashed_masterpwd.toString('base64'),
                salt_1.toString('base64'),
                salt_2.toString('base64'),
                encrypted_key.toString('base64'),
                iv.toString('base64'),
                crypto.randomBytes(20).toString('base64')]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);

            }

        });

    }

    static removeUser(dbConn, uname, callback) {
        var sql = "DELETE FROM users WHERE users.uname = ?";
        let name = uname;
        dbConn.query(sql, name, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });

    }

    static changeUserToken(dbConn, uname, token, callback){
        var sql = `UPDATE users SET token = "${token}" where uname = "${uname}" `
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });
    }

    static getUserToken(dbConn, identification, callback){
        var sql = `SELECT token FROM users WHERE users.uname = "${identification}" OR users.email = "${identification}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(null);
            }
            else {
                try {
                    console.log("Number affected rows " + result.affectedRows);
                    let token = result[0]["token"];
                    console.log(token);
                    callback(token);

                }
                catch (error) {
                    callback(null);
                }
            }
        });
    }

    static addAdmin(dbConn, uname, email, hashedPassword, salt, callback) {
        var sql = "INSERT INTO `admins` VALUES ? ";
        var values = [
            [uname, email, hashedPassword.toString("base64"), salt.toString("base64")]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });

    }

    static removeAdmin(dbConn, uname, callback) {
        var sql = "DELETE FROM admins WHERE admins.uname = ?";
        let name = uname;
        dbConn.query(sql, name, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });
    }

    static changePasswordUser(dbConn, uname, new_hashedhashed_masterpwd, new_salt_1, new_salt_2, new_encrypted_key, callback) {
        var uname = uname;
        var hshmstpwd = new_hashedhashed_masterpwd.toString("base64");
        var salt1 = new_salt_1.toString("base64");
        var salt2 = new_salt_2.toString("base64");
        var encrypted_key = new_encrypted_key.toString("base64");

        var sql = `UPDATE users SET hashedhashed_masterpwd = "${hshmstpwd}", salt_1 = "${salt1}", salt_2 = "${salt2}", encrypted_key = "${encrypted_key}" WHERE users.uname = "${uname}"`;

        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });
    }

    static addNewPassword(dbConn, uname, website_url, website_uname, encypted_pwd, iv, callback) {
        var sql = "INSERT INTO `passwords` VALUES ? ";
        var values = [
            [uname, website_url, website_uname, encypted_pwd.toString("base64"), iv.toString("base64")]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });
    }

    static changePasswordWebsite(dbConn, uname, new_encrypted_pwd, callback) {
        var uname = uname;
        var encrypted_pwd = new_encrypted_pwd.toString("base64");
        var sql = `UPDATE passwords SET ecrypted_pwd = "${encrypted_pwd}" WHERE passwords.uname = "${uname}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });
    }

    static addIP(dbConn, uname, ip, callback) {
        var sql = "INSERT INTO `ips` VALUES ? ";
        var values = [
            [uname, ip]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });
    }

    static addSuperAdmin(dbConn, uname, email, hashedPassword, salt, callback) {
        var sql = "INSERT INTO `admins` VALUES ? ";
        var sql2 = "INSERT INTO super_admins VALUES ?";
        var values = [
            [uname, email, hashedPassword.toString("base64"), salt.toString("base64")]
        ];

        var values2 = [
            [uname]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
        });

        dbConn.query(sql2, [values2], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });
    }

    static changePasswordSuperAdmin(dbConn, uname, new_hashedPassword, new_salt, callback) {
        var uname = uname;
        var hashedPassword = new_hashedPassword.toString("base64");
        var salt = new_salt.toString("base64");
        var sql = `UPDATE super_admins SET hashed_pwd = "${hashedPassword}", salt = "${salt}" WHERE super_admin.uname = "${uname}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });

    }

    static changePasswordAdmin(dbConn, uname, new_hashedPassword, new_salt, callback) {
        var uname = uname;
        var hashedPassword = new_hashedPassword.toString("base64");
        var salt = new_salt.toString("base64");
        var sql = `UPDATE admins SET hashed_pwd = "${hashedPassword}", salt = "${salt}" WHERE super_admin.uname = "${uname}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });
    }

    static addFeedback(dbConn, uname, feedback, callback) {
        var sql = "INSERT INTO `feedback` VALUES ? ";
        var values = [
            [uname, feedback]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(true);
            }
        });

    }

    static getUserPwdForAuthentication(dbConn, uname, callback) {
        var sql = `SELECT hashedhashed_masterpwd FROM users WHERE users.uname = "${uname}"`
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                let hashedhashed_masterpwd = Buffer.from(result[0]["hashedhashed_masterpwd"], "base64");
                callback(hashedhashed_masterpwd);
            }
        });
    }

    static getAdminPwdForAuthentication(dbConn, uname, callback) {
        var sql = `SELECT hashed_pwd FROM admins WHERE admins.uname = "${uname}"`
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                result[0]["hashed_pwd"] = Buffer.from(result[0]["hashed_pwd"], "base64");
                callback(result);
            }
        });
    }

    static getAllUsers(dbConn, callback) {
        var sql = `SELECT uname, email FROM users`
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(result);
            }
        });
    }

    static getAllAdmins(dbConn, callback) {
        var sql = `SELECT uname, email FROM admins`
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(result);
            }
        });
    }

    static getColumsForEncryptingPassword(dbConn, uname, callback) {
        var sql = `SELECT salt_1, salt_2, encrypted_key, iv FROM users WHERE users.uname = "${uname}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(null);
            }
            else if(result.length > 0){
                try {
                    console.log("Number affected rows " + result.affectedRows);
                    result[0]["salt_1"] = Buffer.from(result[0]["salt_1"], "base64");
                    result[0]["salt_2"] = Buffer.from(result[0]["salt_2"], "base64");
                    result[0]["encrypted_key"] = Buffer.from(result[0]["encrypted_key"], "base64");
                    result[0]["iv"] = Buffer.from(result[0]["iv"], "base64");
                    callback(result[0]);
                }
                catch (error) {
                    callback(null);
                }
            }
            else {
                callback(null);
            }
        });
    }

    static getUserSalts(dbConn, uname, callback) {
        var sql = `SELECT salt_1, salt_2 FROM users WHERE users.uname = "${uname}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(null);
            }
            else if(result.length > 0){
                try {
                    console.log("Number affected rows " + result.affectedRows);
                    result[0]["salt_1"] = Buffer.from(result[0]["salt_1"], "base64");
                    result[0]["salt_2"] = Buffer.from(result[0]["salt_2"], "base64");
                    callback(result[0]);

                }
                catch (error) {
                    callback(null);
                }


            }
            else {
                callback(null);
            }
        });
    }

    static getUnameFromIdentification(dbConn, identification, callback) {
        var sql = `SELECT uname FROM users WHERE users.uname = "${identification}" OR users.email = "${identification}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(null);
            }
            else {
                try {
                    console.log("Number affected rows " + result.affectedRows);
                    let uname = result[0]["uname"];
                    console.log(uname);
                    callback(uname);

                }
                catch (error) {
                    callback(null);
                }
            }
        });
    }

    static getWebsitePassword(dbConn, uname, website_url, website_uname, callback) {
        var sql = `SELECT encrypted_pwd, iv FROM passwords WHERE passwords.uname = "${uname}" AND passwords.website_url = "${website_url}" AND passwords.website_uname = "${website_uname}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(null);
            }
            else {
                try {
                    console.log("Number affected rows " + result.affectedRows);
                    result[0]["encrypted_pwd"] = Buffer.from(result[0]["encrypted_pwd"], "base64");
                    result[0]["iv"] = Buffer.from(result[0]["iv"], "base64");
                    callback(result[0]);

                }
                catch (error) {
                    callback(null);
                }
            }
        });
    }

    static getAllWebsitePasswords(dbConn, uname, callback) {
        var sql = `SELECT website_url, website_uname FROM passwords WHERE passwords.uname = "${uname}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(null);
            }
            else {
                try {
                    console.log("Number affected rows " + result.affectedRows);
                    callback(result);

                }
                catch (error) {
                    callback(null);
                }
            }
        });
    }

    static getIPSofUser(dbConn, uname, callback){
        var sql = `SELECT ip FROM ips WHERE ips.uname = "${uname}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log("Number affected rows " + result.affectedRows);
                callback(result);

            }
        });

    }
    
}

module.exports = DataBaseQueries;