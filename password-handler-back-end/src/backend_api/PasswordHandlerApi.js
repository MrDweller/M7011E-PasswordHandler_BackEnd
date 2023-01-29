const express = require('express');

const path = require('path');
const https = require('https');
const oas3Tools = require('oas3-tools');

const cors = require('cors');
const BackEndHandler = require('../backendHandler')
const InvalidToken = require('../errors');

const fs = require('fs');

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

        this.appOptions = {
            key: fs.readFileSync('./src/backend_api/keys/key.pem'),
            cert: fs.readFileSync('./src/backend_api/keys/certificate.pem')
        };
    }

    start() {
        let host = this.host;
        let port = this.port;

        // Initialize the Swagger middleware
        https.createServer(this.appOptions, this.app).listen(this.port, this.host, function () {
            console.log('Your server is listening on port %d (https://%s:%d)', port, host, port);
            console.log('Swagger-ui is available on https://%s:%d/docs', host, port);
        });

    }

}

module.exports = PasswordHandlerApi;