const fs = require('fs');
const MySQL = require('mysql');
var config = JSON.parse(fs.readFileSync("./src/config.json"));
var db_config = {
    host: config["databaseConnection"]["host"],
    user: config["databaseConnection"]["user"],
    password: config["databaseConnection"]["password"],
    database: config["databaseConnection"]["database"]
};

var dbconnection;
function getConn() {
    return dbconnection;
}

function handleDisconnect() {
    // connection = MySQL.createConnection(db_config); 

    // connection.connect(function (err) {             
    //     if (err) {                                     
    //         console.log('error when connecting to db:', err);
    //         setTimeout(handleDisconnect, 2000); 
    //     } else {
    //         console.log("Connected to database!");                                

    //     }
    // });    

    // connection.on('error', function (err) {
    //     console.log('db error', err);
    //     if (err.code === 'PROTOCOL_CONNECTION_LOST') { 
    //         handleDisconnect();                         
    //     } else {                                      
    //         throw err;                                  
    //     }
    // });

    dbconnection = MySQL.createPool(db_config); 

    // Attempt to catch disconnects 
    dbconnection.on('connection', function (connection) {
        console.log('DB Connection established');
    
        connection.on('error', function (err) {
            console.error(new Date(), 'MySQL error', err.code);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') { 
                handleDisconnect();                         
            }
        });
        connection.on('close', function (err) {
            console.error(new Date(), 'MySQL close', err);
        });
    
    });
}

handleDisconnect();
module.exports = {getConn}