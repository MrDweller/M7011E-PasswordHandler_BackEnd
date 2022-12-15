'use strict';

var utils = require('../utils/writer.js');
const backEndHandler = require('../../backendHandler');

const EmailConformationNeeded = require('../../errors');

/**
 * Confirms the given ip of the user with the given token.
 *
 * body Ip Confirme a given ip (optional)
 * uname String The name that needs to be fetched.
 * emailToken Token 
 * no response value expected for this operation
 **/
exports.confirmIpUser = function (body, uname, emailToken) {
  return new Promise(function (resolve, reject) {
    console.log("emailToken " + emailToken);
    let userIP = body["ip"];
    backEndHandler.addIPtoDB(uname, emailToken, userIP, (result) => {
      if (result) {
        resolve();

      }
      else {
        reject();

      }
      

    });
  });
}


/**
 * Create user
 * This creates a new user, on signup.
 *
 * body User Created user object (optional)
 * no response value expected for this operation
 **/
exports.createUser = function (body) {
  return new Promise(function (resolve, reject) {
    let uname = body["uname"];
    let email = body["email"];
    let masterpwd = body["password"];
    let userIP = body["ip"];
    backEndHandler.addUser(uname, email, masterpwd, userIP, (result) => {
      if (result) {
        resolve();

      }
      else {
        reject();
      }
    })
  });
}


/**
 * Delete user
 * This can only be done by the logged in user.
 *
 * uname String The uname for the user
 * userToken Token 
 * no response value expected for this operation
 **/
exports.deleteUser = function (uname, userToken) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
}


/**
 * Get user by user name
 * This can only be done by the logged in user.
 *
 * uname String The name that needs to be fetched.
 * userToken Token 
 * returns UserInfo
 **/
exports.getUserByName = function (uname, userToken) {
  return new Promise(function (resolve, reject) {
    var examples = {};
    examples['application/json'] = {
      "uname": "john",
      "email": "john@email.com"
    };
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Logs user, generating an access token for that user.
 *
 * body Authentication The password for login in clear text (optional)
 * uname String The user name for login
 * no response value expected for this operation
 **/
exports.loginUser = function (body, uname) {
  return new Promise(function (resolve, reject) {
    let masterpwd = body["password"];
    let userIP = body["ip"];
    backEndHandler.loginUser(uname, masterpwd, userIP, (result) => {
      if (result === null) {
        reject();

      }
      else if (result instanceof EmailConformationNeeded) {
        reject(403);
      }
      else {
        let userToken = {"userToken": result};
        resolve(userToken);
      }
    });

  });
}


/**
 * Logs out the user with the given token.
 *
 * uname String The name that needs to be fetched.
 * userToken Token 
 * no response value expected for this operation
 **/
exports.logoutUser = function (uname, userToken) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
}


/**
 * Update user
 * This can only be done by the logged in user.
 *
 * body User Update an existent user (optional)
 * uname String uname for user to be updated
 * userToken Token 
 * no response value expected for this operation
 **/
exports.updateUser = function (body, uname, userToken) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
}

