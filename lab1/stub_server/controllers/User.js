'use strict';

var utils = require('../utils/writer.js');
var User = require('../service/UserService');

module.exports.loginPOST = function addPet (req, res, next, body) {
  User.loginPOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logoutPOST = function logoutPOST (req, res, next) {
  User.logoutPOST()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
