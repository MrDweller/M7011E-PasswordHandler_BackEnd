'use strict';
const backEndHandler = require('../../backendHandler');

/**
 * Confirms the given ip of the user with the given token.
 *
 * body Ip Confirme a given ip (optional)
 * uname String The name that needs to be fetched.
 * emailToken Token 
 * no response value expected for this operation
 **/
exports.confirmIpAdmin = function(body,uname,emailToken) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Create admin
 * This creates a new user, on signup.
 *
 * body UserInfo Created admin object (optional)
 * superAdminToken Token 
 * no response value expected for this operation
 **/
exports.createAdmin = function(body,superAdminToken) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Delete admin
 * This can only be done by the logged in user.
 *
 * uname String The uname for the user
 * adminToken Token  (optional)
 * superAdminToken Token  (optional)
 * no response value expected for this operation
 **/
exports.deleteAdmin = function(uname,adminToken,superAdminToken) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Get admin by user name
 * This can only be done by the logged in user.
 *
 * uname String The name that needs to be fetched.
 * adminToken Token 
 * returns UserInfo
 **/
exports.getAdminByName = function(uname,adminToken) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "uname" : "john",
  "email" : "john@email.com"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Logs in admin, generating an access token for that admin.
 *
 * body Authentication The password for login in clear text (optional)
 * uname String The user name for login
 * no response value expected for this operation
 **/
exports.loginAdmin = function(body,uname) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Logs out the admin with the given token.
 *
 * uname String The name that needs to be fetched.
 * adminToken Token 
 * no response value expected for this operation
 **/
exports.logoutAdmin = function(uname,adminToken) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Update admin
 * This can only be done by the logged in user.
 *
 * body User Update an existent user (optional)
 * uname String uname for user to be updated
 * adminToken Token 
 * no response value expected for this operation
 **/
exports.updateAdmin = function(body,uname,adminToken) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

