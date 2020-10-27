'use strict';

var utils = require('../utils/writer.js');
var Task = require('../service/TaskService');

module.exports.tasksGET = function tasksGET (req, res, next) {
  Task.tasksGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tasksIdDELETE = function tasksIdDELETE (req, res, next, id) {
  Task.tasksIdDELETE(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tasksIdGET = function tasksIdGET (req, res, next, id) {
  Task.tasksIdGET(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tasksIdPUT = function tasksIdPUT (req, res, next, body, id) {
  Task.tasksIdPUT(body, id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tasksPOST = function tasksPOST (req, res, next, body) {
  Task.tasksPOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tasksUserGET = function tasksUserGET (req, res, next) {
  Task.tasksUserGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
