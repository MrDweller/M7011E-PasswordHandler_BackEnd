const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const BackEndHandler = require('../backendHandler')
const InvalidToken = require('../errors');

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

        this.expressApi.post('/uploadPFP', function (request, response) {
            try {
                console.log("request.body: " + request.body);

                
                backEndHandler.uploadPFP(request.body, (data) => {
                    console.log("uploadPFP DATA: " + data);
                    console.log("below uploadPFP DATA");
                    console.log("response: " + response)
                    let responseBody = {};
                    responseBody["status"] = data;
                    backEndHandler.getPFPURL(request.body, (pfpURL) => {
                        responseBody["pfpURL"] = pfpURL
                        response.status(200).send(responseBody);
                    })

                    
                });
                 
            } catch (error) {
                console.log(error);
                response.status(400).end();
            }

        });

        this.expressApi.post('/getPFP', function (request, response) {
            try {
                console.log("request.body: " + request.body);

                
                backEndHandler.getPFPURL(request.body, (data) => {
                    
                    let responseBody = {};
                    responseBody["status"] = data;
                    console.log("response from getPFPURL in PasswordHandlerAPI = " + responseBody["status"]);

                    response.status(200).send(responseBody);
                });
                 
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
                    if (data instanceof InvalidToken)
                    {
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


        this.expressApi.post('/authenticate', function(request, response){
            try {
                console.log(request.body);
                backEndHandler.loginUser(request.body, (data) => {
                    console.log(data);
                    let responseBody = {};
                    responseBody["token"] = data;
                    response.status(200).send(responseBody);
                });
            } catch(error){
                console.log(error)
                response.status(400).end();
            }
        });

        this.expressApi.post('/readAllPasswords', function (request, response) {
            try {
                console.log("request.body: " + request.body);
                
                backEndHandler.getAllPasswords(request.body, (data) => {
                    console.log(data);
                    if (data instanceof InvalidToken)
                    {
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
                    if (data instanceof InvalidToken)
                    {
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
                    if (data instanceof InvalidToken)
                    {
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
                    if (data instanceof InvalidToken)
                    {
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
                    if (data instanceof InvalidToken)
                    {
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