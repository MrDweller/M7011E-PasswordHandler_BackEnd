'use strict';

var utils = require('../utils/writer.js');
var Admins = require('../service/AdmisService');

module.exports.getAdmins = function getAdmins(req, res, next, super_admin_uname, super_admin_token) {
    Admins.getAdmins(super_admin_uname, super_admin_token)
        .then(function(response) {
            utils.writeJson(res, response);
        })
        .catch(function(response) {
            utils.writeErrorCode(res, response);
        });
}