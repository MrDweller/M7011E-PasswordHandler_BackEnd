const express = require('express');

const path = require('path');
const http = require('http');
const oas3Tools = require('oas3-tools');

const cors = require('cors');
const BackEndHandler = require('../backendHandler')
const InvalidToken = require('../errors');

class PasswordHandlerApi {
    constructor(host, port) {
        this.host = host;
        this.port = port;

        var corsOptions = {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            exposedHeaders:  '*',
            optionsSuccessStatus: 204 // For legacy browser support
        }


        // swaggerRouter configuration
        var options = {
            routing: {
                controllers: path.join(__dirname, './controllers')
            },
        };

        let expressAppConfig = oas3Tools.expressAppConfig('./openapi.yaml', options);
        let openApiApp = expressAppConfig.getApp();
        this.app = express();

        // Add headers
        this.app.use(cors(corsOptions));
        for (let i = 2; i < openApiApp._router.stack.length; i++) {
            this.app._router.stack.push(openApiApp._router.stack[i])
        }

    }

    start() {
        let host = this.host;
        let port = this.port;

        // Initialize the Swagger middleware
        http.createServer(this.app).listen(this.port, this.host, function () {
            console.log('Your server is listening on port %d (http://%s:%d)', port, host, port);
            console.log('Swagger-ui is available on http://%s:%d/docs', host, port);
        });

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
                console.log("request.body: " + request.body);


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

        this.expressApi.post('/readUserName', function (request, response) {
            try {
                console.log("request.body: " + request.body);


                backEndHandler.readUserName(request.body, (data) => {
                    if (data instanceof InvalidToken) {
                        let responseBody = {};
                        responseBody["error"] = "INVALID_TOKEN";

                        response.status(200).send(responseBody);
                        return;
                    }
                    console.log(data);

                    let responseBody = {};
                    responseBody["uname"] = data;

                    response.status(200).send(responseBody);
                });

            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });

        this.expressApi.post('/email', function (request, response) {
            try {
                console.log("request.body: " + request.body);

                backEndHandler.resetPassword(request.body, (data) => {
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


        this.expressApi.post('/authenticate', function (request, response) {
            try {
                console.log(request.body);
                backEndHandler.loginUser(request.body, (data) => {
                    console.log(data);
                    let responseBody = {};
                    responseBody["token"] = data;
                    response.status(200).send(responseBody);
                });
            } catch (error) {
                console.log(error)
                response.status(400).end();
            }
        });

        this.expressApi.post('/readAllPasswords', function (request, response) {
            try {
                console.log("request.body: " + request.body);

                backEndHandler.getAllPasswords(request.body, (data) => {
                    console.log(data);
                    if (data instanceof InvalidToken) {
                        let responseBody = {};
                        responseBody["error"] = "INVALID_TOKEN";

                        response.status(200).send(responseBody);
                        return;
                    }
                    //let responseBody = {};
                    //responseBody["passwords"] = data;

                    response.status(200).send(data);


                });

            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });

        this.expressApi.post('/readPassword', function (request, response) {
            try {
                console.log("request.body: " + request.body);

                backEndHandler.readPassword(request.body, (data) => {
                    console.log(data);
                    if (data instanceof InvalidToken) {
                        let responseBody = {};
                        responseBody["error"] = "INVALID_TOKEN";

                        response.status(200).send(responseBody);
                        return;
                    }

                    let responseBody = {};
                    responseBody["password"] = data;

                    response.status(200).send(responseBody);
                });

            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });

        this.expressApi.post('/changeMasterPassword', function (request, response) {
            try {
                console.log("request.body: " + request.body);

                backEndHandler.changeMasterPassword(request.body, (data) => {
                    console.log(data);
                    if (data instanceof InvalidToken) {
                        let responseBody = {};
                        responseBody["error"] = "INVALID_TOKEN";

                        response.status(200).send(responseBody);
                        return;
                    }

                    let responseBody = {};
                    responseBody["status"] = data;

                    response.status(200).send(responseBody);
                });

            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });

        this.expressApi.post('/changeUname', function (request, response) {
            try {
                console.log("request.body: " + request.body);

                backEndHandler.changeUname(request.body, (data) => {
                    console.log(data);
                    if (data instanceof InvalidToken) {
                        let responseBody = {};
                        responseBody["error"] = "INVALID_TOKEN";

                        response.status(200).send(responseBody);
                        return;
                    }

                    let responseBody = {};
                    responseBody["status"] = data;

                    response.status(200).send(responseBody);
                });

            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });

        this.expressApi.post('/requestEmailChange', function (request, response) {
            try {
                console.log("request.body: " + request.body);

                backEndHandler.requestEmailChange(request.body, (data) => {
                    console.log(data);
                    if (data instanceof InvalidToken) {
                        let responseBody = {};
                        responseBody["error"] = "INVALID_TOKEN";

                        response.status(200).send(responseBody);
                        return;
                    }

                    let responseBody = {};
                    responseBody["status"] = data;

                    response.status(200).send(responseBody);
                });

            } catch (error) {
                console.log(error);
                response.status(400).end();
            }
        });

        this.expressApi.post('/confirmIP', function (request, response) {
            try {
                console.log("in c/confirmIP");

                backEndHandler.addIPtoDB(request.body, (data) => {
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