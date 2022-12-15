'use strict';


/**
 * Create password
 * This creates a new password for a user.
 *
 * body WebsitePasswordAuthentication  (optional)
 * uname String The uname for the user
 * userToken Token 
 * no response value expected for this operation
 **/
exports.createPassword = function(body,uname,userToken) {
  return new Promise(function(resolve, reject) {
    resolve();
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
exports.decryptPassword = function(body,uname,userToken) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "website_url" : "google.com",
  "website_uname" : "john",
  "website_password" : "12345"
}, {
  "website_url" : "google.com",
  "website_uname" : "john",
  "website_password" : "12345"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

