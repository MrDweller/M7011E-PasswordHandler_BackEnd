const PasswordHandlerApi = require("./backend_api/PasswordHandlerApi");
const fs = require('fs');

function main() {
    let config = JSON.parse(fs.readFileSync("./src/config.json"));
    let passwordHandlerApi = new PasswordHandlerApi(config["serverSettings"]["host"], config["serverSettings"]["port"]);


    passwordHandlerApi.start();
}


main(process.argv.slice(2));
