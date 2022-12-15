'use strict';


/**
 * Read all passwords
 * This gives all passwords for an user.
 *
 * uname String The uname for the user
 * userToken Token 
 * returns List
 **/
exports.readPasswords = function(uname,userToken) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "website_url" : "google.com",
  "website_uname" : "john"
}, {
  "website_url" : "google.com",
  "website_uname" : "john"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

