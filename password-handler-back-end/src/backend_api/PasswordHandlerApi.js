const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const BackEndHandler = require('../backendHandler')
class PasswordHandlerApi {
    constructor(host, port) {
        this.host = host;
        this.port = port;

        this.expressApi = express();
        this.expressApi.use(bodyParser.json());
        
        var corsOptions = {
            origin: 'http://localhost:3000',
            optionsSuccessStatus: 200 // For legacy browser support
        }
        
        this.expressApi.use(cors(corsOptions));

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
                let responseBody = {};
                responseBody["status"] = true;

                response.status(200).send(responseBody);
            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });

        this.expressApi.post('/user', function (request, response) {
            try {
                console.log(request.body);

                
                backEndHandler.addUser(request.body, (data) => {
                    console.log(data);

                    let responseBody = {};
                    responseBody["status"] = data;

                    response.status(200).send(responseBody);
                });
                
            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });

        this.expressApi.post('/authenticate', function(request, response){
            try {
                console.log(request.body);
                backEndHandler.loginUser(request.body, (data) => {
                    console.log(data);
                    let responseBody = {};
                    responseBody["status"] = data;
                    response.status(200).send(responseBody);
                });
            } catch(error){
                console.log(error)
                response.status(400).end();
            }
        });

        this.expressApi.post('/readPassword', function (request, response) {
            try {
                console.log("request.body: " + request.body);

                backEndHandler.readPassword(request.body, (data) => {
                    console.log(data);

                    let responseBody = {};
                    responseBody["password"] = data;

                    response.status(200).send(responseBody);
                });
                
            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });

        this.expressApi.post('/addPassword', function (request, response) {
            try {
                console.log("request.body: " + request.body);
                
                backEndHandler.addPassword(request.body, (data) => {
                    console.log(data);

                    let responseBody = {};
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