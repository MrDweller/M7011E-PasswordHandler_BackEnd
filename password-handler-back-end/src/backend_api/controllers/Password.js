'use strict';

var utils = require('../utils/writer.js');
var Password = require('../service/PasswordService');

module.exports.createPassword = function createPassword (req, res, next, body, uname, user_token) {
  Password.createPassword(body, uname, user_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeHeaders(res, null, response);
    });
};

module.exports.decryptPassword = function decryptPassword (req, res, next, body, uname, user_token) {
  Password.decryptPassword(body, uname, user_token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeHeaders(res, null, response);
    });
};

module.exports.regeneratePassword = function regeneratePassword (req, res, next, body, uname, user_token) {
  Password.regeneratePassword(body, uname, user_token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeHeaders(res, null, response);
    });
};

module.exports.deletePassword = function deletePassword (req, res, next, body, uname, user_token) {
  Password.deletePassword(body, uname, user_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeHeaders(res, null, response);
    });
};
