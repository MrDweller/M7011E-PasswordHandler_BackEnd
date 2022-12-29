'use strict';

var utils = require('../utils/writer.js');
var Passwords = require('../service/PasswordsService');

module.exports.readPasswords = function readPasswords (req, res, next, uname, user_token) {
  console.log(user_token);
  Passwords.readPasswords(uname, user_token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeHeaders(res, null, response);
    });
};
