class DataBaseQueries {
    static addUser(dbConn, uname, email, hashedhashed_masterpwd, salt_1, salt_2, encrypted_key, iv, callback) {
        var sql = "INSERT INTO `users` VALUES ? ";
        var values = [
            [uname, email, hashedhashed_masterpwd, salt_1, salt_2, encrypted_key, iv]
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
}

module.exports = DataBaseQueries;