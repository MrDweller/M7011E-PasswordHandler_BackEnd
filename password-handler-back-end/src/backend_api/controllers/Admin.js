'use strict';

var utils = require('../utils/writer.js');
var Admin = require('../service/AdminService');

module.exports.confirmIpAdmin = function confirmIpAdmin (req, res, next, body, uname, email_token) {
  Admin.confirmIpAdmin(body, uname, email_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.createAdmin = function createAdmin (req, res, next, body, super_admin_uname, super_admin_token) {
  Admin.createAdmin(body, super_admin_uname, super_admin_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.addAdminPassword = function addAdminPassword (req, res, next, body, uname, email_token) {
  Admin.addAdminPassword(body, uname, email_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.deleteAdmin = function deleteAdmin (req, res, next, body, uname, admin_token, super_admin_uname, super_admin_token) {
  console.log(body);
  console.log(uname);
  Admin.deleteAdmin(uname, admin_token, super_admin_uname, super_admin_token, body)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.getAdminByName = function getAdminByName (req, res, next, uname, admin_token) {
  Admin.getAdminByName(uname, admin_token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.loginAdmin = function loginAdmin (req, res, next, body, uname) {
  Admin.loginAdmin(body, uname)
    .then(function (response) {
      utils.writeHeaders(res, response, 200);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.logoutAdmin = function logoutAdmin (req, res, next, uname, admin_token) {
  Admin.logoutAdmin(uname, admin_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};

module.exports.updateAdmin = function updateAdmin (req, res, next, body, uname, admin_token) {
  Admin.updateAdmin(body, uname, admin_token)
    .then(function (response) {
      utils.writeHeaders(res, null, response);
    })
    .catch(function (response) {
      utils.writeErrorCode(res, response);
    });
};
