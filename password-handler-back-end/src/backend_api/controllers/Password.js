'use strict';

var utils = require('../utils/writer.js');
var Password = require('../service/PasswordService');

module.exports.createPassword = function createPassword (req, res, next, body, uname, userToken) {
  Password.createPassword(body, uname, userToken)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeHeaders(res, null, response);
    });
};

module.exports.decryptPassword = function decryptPassword (req, res, next, body, uname, userToken) {
  Password.decryptPassword(body, uname, userToken)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeHeaders(res, null, response);
    });
};
