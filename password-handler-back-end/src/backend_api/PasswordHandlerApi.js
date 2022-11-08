const express = require('express');
const bodyParser = require('body-parser');
const BackEndHandler = require('../backendHandler')
class PasswordHandlerApi {
    constructor(host, port) {
        this.host = host;
        this.port = port;

        this.expressApi = express();
        this.expressApi.use(bodyParser.json());
        

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
        let backEndHandler = new BackEndHandler();
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

        this.expressApi.post('/addUser', function (request, response) {
            try {
                console.log(request.body);

                
                backEndHandler.addUser(request.body, (data) => {
                    console.log(data);

                    var responseBody = {};
                    responseBody["status"] = data;

                    response.status(200).send(responseBody);
                });
                
            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });
    }

}

module.exports = PasswordHandlerApi;