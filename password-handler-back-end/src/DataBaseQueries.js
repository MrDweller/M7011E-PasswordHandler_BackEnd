class DataBaseQueries {
    static addUser(dbConn, uname, email, hashedhashed_masterpwd, salt_1, salt_2, encrypted_key, iv, callback) {
        var sql = "INSERT INTO `users` VALUES ? ";
        var values = [
            [uname, email, hashedhashed_masterpwd, salt_1, salt_2, encrypted_key, iv]
        ];
        dbConn.query(sql, [values], (err) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            //console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
        
    }
    
    static removeUser(dbConn, uname, callback){
        var sql = "DELETE FROM users WHERE users.uname = ?";
        let name = uname;
        dbConn.query(sql, name, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
        
    }

    static addAdmin(dbConn, uname, email, hashedPassword, salt,callback){
        var sql = "INSERT INTO `admins` VALUES ? ";
        var values = [
            [uname, email, hashedPassword, salt]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
    
    }

    static removeAdmin(dbConn, uname, callback){
        var sql = "DELETE FROM admins WHERE admins.uname = ?";
        let name = uname;
        dbConn.query(sql, name, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
    }

    static changePasswordUser(dbConn,uname, new_hashedhashed_masterpwd, new_salt_1, new_salt_2, new_encrypted_key, callback){
        var uname = uname;
        var hshmstpwd = new_hashedhashed_masterpwd;
        var salt1 = new_salt_1;
        var salt2 = new_salt_2;
        var encrypted_key = new_encrypted_key;

        var sql = `UPDATE users SET hashedhashed_masterpwd = "${hshmstpwd}", salt_1 = "${salt1}", salt_2 = "${salt2}", encrypted_key = "${encrypted_key}" WHERE users.uname = "${uname}"`;

        dbConn.query(sql,(err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
    }

    static addNewPassword(dbConn, uname, website_url, website_uname, encypted_pwd, callback){
        var sql = "INSERT INTO `passwords` VALUES ? ";
        var values = [
            [uname, website_url, website_uname, encypted_pwd]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
    }

    static changePasswordWebsite(dbConn, uname, new_encrypted_pwd, callback){
        var uname = uname;
        var encrypted_pwd = new_encrypted_pwd;
        var sql = `UPDATE passwords SET ecrypted_pwd = "${encrypted_pwd}" WHERE passwords.uname = "${uname}"`;
        dbConn.query(sql,(err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
    }

    static addIP(dbConn, uname, ip, callback){
        var sql = "INSERT INTO `ips` VALUES ? ";
        var values = [
            [uname, ip]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
    }

    static addSuperAdmin(dbConn, uname, email, hashedPassword, salt, callback){
        var sql = "INSERT INTO `admins` VALUES ? ";
        var sql2 = "INSERT INTO super_admins VALUES ?";
        var values = [
            [uname, email, hashedPassword, salt]
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
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
    }

    static changePasswordSuperAdmin(dbConn,uname,new_hashedPassword, new_salt, callback){
        var uname = uname;
        var hashedPassword = new_hashedPassword;
        var salt = new_salt;
        var sql = `UPDATE super_admins SET hashed_pwd = "${hashedPassword}", salt = "${salt}" WHERE super_admin.uname = "${uname}"`;
        dbConn.query(sql,(err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });

    }

    static changePasswordAdmin(dbConn, uname, new_hashedPassword, new_salt , callback){
        var uname = uname;
        var hashedPassword = new_hashedPassword;
        var salt = new_salt;
        var sql = `UPDATE admins SET hashed_pwd = "${hashedPassword}", salt = "${salt}" WHERE super_admin.uname = "${uname}"`;
        dbConn.query(sql,(err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });
    }

    static addFeedback(dbConn, uname, feedback, callback){
        var sql = "INSERT INTO `feedback` VALUES ? ";
        var values = [
            [uname, feedback]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(true);
        });

    }

    static getUserForLoginAuthentication(dbConn,identification, callback){
        var identification = identification;
        var sql = `SELECT hashedhashed_masterpwd FROM users WHERE users.uname = "${identification}" OR users.email = "${identification}"`
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(result);
        });
    }

    static getAdminForLoginAuthentication(dbConn, identification, callback){
        var sql = `SELECT hashed_pwd FROM admins WHERE admins.uname = "${identification}" OR admins.email = "${identification}"`
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(result);
        });
    }

    static getAllUsers(dbConn, callback){
        var sql = `SELECT uname, email FROM users`
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(result);
        });
    }

    static getAllAdmins(dbConn, callback){
        var sql = `SELECT uname, email FROM admins`
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(result);
        });
    }

    static getColumsForEncryptingPassword(dbConn, uname, callback){
        var sql = `SELECT salt_1, salt_2, encrypted_key, iv FROM users WHERE users.uname = "${uname}"`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(result);
        });
    }

    static getUserSalts(dbConn, uname, callback){
        var sql = `SELECT salt_1, salt_2 FROM users WHERE users.uname = "${uname}`;
        dbConn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            }
            console.log("Number affected rows " + result.affectedRows);
            callback(result);
        });
    }
}

module.exports = DataBaseQueries;