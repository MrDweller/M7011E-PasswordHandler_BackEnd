'use strict';

var utils = require('../utils/writer.js');
var User = require('../service/UserService');

module.exports.confirmIpUser = function confirmIpUser (req, res, next, body, uname, email_token) {
  User.confirmIpUser(body, uname, email_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.createUser = function createUser (req, res, next, body) {
  User.createUser(body)
    .then(function () {
      utils.writeHeaders(res, null, 201);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.deleteUser = function deleteUser (req, res, next, uname, user_token, admin_uname, admin_token) {
  User.deleteUser(uname, user_token, admin_uname, admin_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.getUname = function getUname(req, res, next, identification) {
  User.getUname(identification)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });

}

module.exports.getUserByName = function getUserByName (req, res, next, uname, user_token) {
  console.log(user_token);
  User.getUserByName(uname, user_token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.loginUser = function loginUser (req, res, next, body, uname) {
  User.loginUser(body, uname)
    .then(function (response) {
      utils.writeHeaders(res, response, 200);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.logoutUser = function logoutUser (req, res, next, uname, user_token) {
  User.logoutUser(uname, user_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.updateUser = function updateUser (req, res, next, body, uname, user_token) {
  User.updateUser(body, uname, user_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.uploadPFP = function uploadPFP (req, res, next, uname, user_token) {
  User.uploadPFP(uname, user_token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.getPFP = function getPFP (req, res, next, uname, user_token) {
  User.getPFP(uname, user_token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};
