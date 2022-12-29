'use strict';
const backEndHandler = require('../../backendHandler');
const ServerErrors = require('../../errors');

exports.getUsers = function(admin_uname, admin_token) {
    return new Promise(function(resolve, reject) {
        backEndHandler.getUsers(admin_uname, admin_token, (result) => {
            if (result instanceof ServerErrors.InvalidToken) {
                reject(403);
                return;
            }
            
            if (result instanceof ServerErrors.ServerError) {
                reject(500);
                return;
            }
            resolve(result);
        }); 
    });
}