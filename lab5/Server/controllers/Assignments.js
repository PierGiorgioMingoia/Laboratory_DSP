'use strict';

var utils = require('../utils/writer.js');
var Assignments = require('../service/AssignmentsService');

var mqtt = require('mqtt')


var clientId = 'mqttjs-' + Math.random().toString(16).substr(2, 8);
var host = 'ws://127.0.0.1:8080';
var options = {
  keepalive: 30,
  clientId: clientId,
  clean: true,
  reconnectPeriod: 60000,
  connectTimeout: 30 * 1000,
  will: {
    topic: 'chat',
    payload: `${clientId} disconnected abruptly`,
    qos: 0,
    retain: false
  },
  rejectUnauthorized: false
}

console.log('connecting mqtt client');
var client = mqtt.connect(host, options);
client.publish("testtopic", "test message");

module.exports.assign = function assign(req, res, next) {
  Assignments.assignBalanced()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
    });
};

module.exports.assignTaskToUser = function assignTaskToUser(req, res, next) {
  Assignments.assignTaskToUser(req.body.id, req.params.taskId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
    });
};

module.exports.getUsersAssigned = function getUsersAssigned(req, res, next) {
  Assignments.getUsersAssigned(req.params.taskId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
    });
};

module.exports.removeUser = function removeUser(req, res, next) {
  Assignments.removeUser(req.params.taskId, req.params.userId)
    .then(function (response) {
      utils.writeJson(res, response, 204);
    })
    .catch(function (response) {
      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
    });
};

module.exports.selectTask = function selectTask(req, res, next) {
  var userId = req.params.userId;
  var taskId = req.body.id;
  if (taskId == undefined) {
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Missing taskId query parameter' }], }, 400);
  }
  Assignments.selectTask(userId, taskId)
    .then(function (response) {
      console.log(userId)
      let message = {
        status: 'active',
        userId: userId,
        userName: 'Karl Franz'
      }
      client.publish(''+taskId, JSON.stringify(message));

      utils.writeJson(res, response, 204);

    })
    .catch(function (response) {
      console.log(response);
      if (response == "Not_Found") {
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 404);
      } else {
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
      }
    });
};
