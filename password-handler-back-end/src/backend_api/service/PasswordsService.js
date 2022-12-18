'use strict';

const backEndHandler = require('../../backendHandler');

const ServerErrors = require('../../errors');


/**
 * Read all passwords
 * This gives all passwords for an user.
 *
 * uname String The uname for the user
 * userToken Token 
 * returns List
 **/
exports.readPasswords = function (uname, userToken) {
  return new Promise(function (resolve, reject) {
    backEndHandler.getAllPasswords(uname, userToken, (result) => {
      if (result instanceof ServerErrors.InvalidToken) {
        reject(400);
        return;
      }
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }
      resolve(result);
    });
  });
}

