const express = require('express');
const bodyParser = require('body-parser');
const BackEndHandler = require('../backendHandler')
class PasswordHandlerApi {
    constructor(host, port) {
        this.host = host;
        this.port = port;

        this.expressApi = express();
        this.expressApi.use(bodyParser.json());
        this.backEndHandler = new BackEndHandler();
        

    }

    start() {
        let host = this.host;
        let port = this.port;
        this.server = this.expressApi.listen(this.port, this.host, function () {
            console.log("PasswordHandlerApi started at: " + host + ":" + port);
        });        

        this.#listenForApiRequests();

    }

    #listenForApiRequests() {
        this.expressApi.get('/available', function (request, response) {
            try {
                var responseBody = {};
                responseBody["status"] = true;

                response.status(200).send(responseBody);
            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });
    }

}

module.exports = PasswordHandlerApi;