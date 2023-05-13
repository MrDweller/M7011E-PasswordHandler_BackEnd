var config = JSON.parse(fs.readFileSync("./src/config.json"));
var db_config = {
    host: this.config["databaseConnection"]["host"],
    user: this.config["databaseConnection"]["user"],
    password: this.config["databaseConnection"]["password"],
    database: this.config["databaseConnection"]["database"]
};

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config); 

    connection.connect(function (err) {             
        if (err) {                                     
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); 
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
module.exports = {connection}