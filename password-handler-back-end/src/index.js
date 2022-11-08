const PasswordHandlerApi = require("./backend_api/PasswordHandlerApi");

function main(args) {
    passwordHandlerApi = new PasswordHandlerApi(args[0], args[1]);
    passwordHandlerApi.start();
}


main(process.argv.slice(2));
