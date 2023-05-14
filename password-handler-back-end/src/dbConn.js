const fs = require('fs');
const MySQL = require('mysql');
var config = JSON.parse(fs.readFileSync("./src/config.json"));
var db_config = {
    host: config["databaseConnection"]["host"],
    user: config["databaseConnection"]["user"],
    password: config["databaseConnection"]["password"],
    database: config["databaseConnection"]["database"]
};

var connection;
function getConn() {
    return connection;
}

function handleDisconnect() {
    connection = MySQL.createPool(db_config); 

    connection.connect(function (err) {             
        if (err) {                                     
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); 
        } else {
            console.log("Connected to database!");                                

        }
    });                                     
    
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { 
            handleDisconnect();                         
        } else {                                      
            throw err;                                  
        }
    });
}

handleDisconnect();
module.exports = {getConn}