'use strict';

var utils = require('../utils/writer.js');
var Users = require('../service/UsersService');

module.exports.getUsers = function getUsers(req, res, next, admin_uname, admin_token) {
    Users.getUsers(admin_uname, admin_token)
        .then(function(response) {
            utils.writeJson(res, response);
        })
        .catch(function(response) {
            utils.writeErrorCode(res, response);
        });
}