'use strict';

const backEndHandler = require('../../backendHandler');

const ServerErrors = require('../../errors');

/**
 * Create password
 * This creates a new password for a user.
 *
 * body WebsitePasswordAuthentication  (optional)
 * uname String The uname for the user
 * userToken Token 
 * no response value expected for this operation
 **/
exports.createPassword = function (body, uname, userToken) {
  return new Promise(function (resolve, reject) {
    let masterpwd = body["password"];
    let website_url = body["website_url"];
    let website_uname = body["website_uname"];
    backEndHandler.addPassword(masterpwd, website_url, website_uname, uname, userToken, (result) => {
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.WrongMasterPassword) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }
      resolve(201);
    });
  });
}


/**
 * Decrypt password
 * This decrypts a password and retrives it.
 *
 * body WebsitePasswordAuthentication  (optional)
 * uname String The uname for the user
 * userToken Token 
 * returns List
 **/
exports.decryptPassword = function (body, uname, userToken) {
  return new Promise(function (resolve, reject) {
    let masterpwd = body["password"];
    let website_url = body["website_url"];
    let website_uname = body["website_uname"];
    backEndHandler.readPassword(masterpwd, website_url, website_uname, uname, userToken, (result) => {
      if (result instanceof ServerErrors.InvalidToken) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.WrongMasterPassword) {
        reject(403);
        return;
      }
      if (result instanceof ServerErrors.InternalServerError) {
        reject(500);
        return;
      }

      if (result instanceof ServerErrors.ServerError) {
        reject(500);
        return;
      }
      let response = {
        "website_url": website_url,
        "website_uname": website_uname,
        "website_password": result
      }
      resolve(response);
    });
  });
}

