'use strict';


/**
 *
 * returns List
 **/
exports.tasksGET = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "important" : false,
  "date" : "2000-01-23",
  "private" : true,
  "projects" : [ "Personal", "Personal" ],
  "description" : "description",
  "id" : 0,
  "completed" : false,
  "assignedTo" : [ 6, 6 ]
}, {
  "important" : false,
  "date" : "2000-01-23",
  "private" : true,
  "projects" : [ "Personal", "Personal" ],
  "description" : "description",
  "id" : 0,
  "completed" : false,
  "assignedTo" : [ 6, 6 ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * asd
 * as
 *
 * id Integer asd
 * no response value expected for this operation
 **/
exports.tasksIdDELETE = function(id) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * sas
 * sad
 *
 * id Integer as
 * returns task
 **/
exports.tasksIdGET = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "important" : false,
  "date" : "2000-01-23",
  "private" : true,
  "projects" : [ "Personal", "Personal" ],
  "description" : "description",
  "id" : 0,
  "completed" : false,
  "assignedTo" : [ 6, 6 ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 *
 * body Task update task obj
 * id Integer asd
 * no response value expected for this operation
 **/
exports.tasksIdPUT = function(body,id) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * add new task
 *
 * body New_task 
 * returns inline_response_200
 **/
exports.tasksPOST = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "id" : "id"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 *
 * returns List
 **/
exports.tasksUserGET = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "important" : false,
  "date" : "2000-01-23",
  "private" : true,
  "projects" : [ "Personal", "Personal" ],
  "description" : "description",
  "id" : 0,
  "completed" : false,
  "assignedTo" : [ 6, 6 ]
}, {
  "important" : false,
  "date" : "2000-01-23",
  "private" : true,
  "projects" : [ "Personal", "Personal" ],
  "description" : "description",
  "id" : 0,
  "completed" : false,
  "assignedTo" : [ 6, 6 ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

