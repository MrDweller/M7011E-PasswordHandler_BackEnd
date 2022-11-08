class DataBaseQueries {
    static addUser(dbConn, uname, email, hashedhashed_masterpwd, salt_1, salt_2, encrypted_key, iv) {
        var sql = "INSERT INTO `users` VALUES ? ";
        var values = [
            [uname, email, hashedhashed_masterpwd, salt_1, salt_2, encrypted_key, iv]
        ];
        dbConn.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                return false;
            }
            console.log("Number affected rows " + result.affectedRows);
            return true;
        });
    }   
}

module.exports = DataBaseQueries;