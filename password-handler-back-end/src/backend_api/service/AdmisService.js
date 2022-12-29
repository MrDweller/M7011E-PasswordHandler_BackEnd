'use strict';
const backEndHandler = require('../../backendHandler');
const ServerErrors = require('../../errors');

exports.getAdmins = function(super_admin_uname, super_admin_token) {
    return new Promise(function(resolve, reject) {
        backEndHandler.getAdmins(super_admin_uname, super_admin_token, (result) => {
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