'use strict';

var path = require('path');
var http = require('http');
var cookieParser = require('cookie-parser');
var jwt = require('express-jwt');
var fs = require("fs");
var { Validator, ValidationError } = require('express-json-validator-middleware');


const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 5000 });

wss.on('connection', function connection(ws) {
    try {
        for (const [key, value] of Object.entries(user_active_map)) {
            const message = { typeMessage: 'login', ...user_active_map[key] }
            ws.send(JSON.stringify(message))
        }
    } catch (err) {
        console.log(err);
    }
});

const user_active_map = {};

module.exports.addNewUser = (user) => {
    console.log(user_active_map);
    user_active_map[user.userId] = user;
    wss.clients.forEach((client) => {
        try {
            const message = { typeMessage: 'login', ...user_active_map[user.userId] }
            client.send(JSON.stringify(message))
        } catch (err) {
            console.log(err);
        }
    });
}

module.exports.removeUser = (user) => {
    delete user_active_map[user.id];
    console.log(user_active_map);
    wss.clients.forEach((client) => {
        try {
            const message = { typeMessage: 'logout', userId: user.id }
            client.send(JSON.stringify(message))
        } catch (err) {
            console.log(err);
        }
    });
}

module.exports.updateActiveSatus = (user) => {
    user_active_map[user.userId] = {...user, userName: user_active_map[user.userId].userName};
    wss.clients.forEach((client) => {
        try {
            const message = { typeMessage: 'update', ...user_active_map[user.userId] }
            console.log(message)
            client.send(JSON.stringify(message))
        } catch (err) {
            console.log(err);
        }
    });
}

var oas3Tools = require('oas3-tools');
var serverPort = 3000;

var taskController = require(path.join(__dirname, 'controllers/Tasks'));
var userController = require(path.join(__dirname, 'controllers/Users'));
var assignmentController = require(path.join(__dirname, 'controllers/Assignments'));

// swaggerRouter configuration
var options = {
    controllers: path.join(__dirname, './controllers')
};
var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
expressAppConfig.addValidator();
var app = expressAppConfig.getApp();

// Set validator middleware
var taskSchema = JSON.parse(fs.readFileSync(path.join('.', 'json_schemas', 'task_schema.json')).toString());
var userSchema = JSON.parse(fs.readFileSync(path.join('.', 'json_schemas', 'user_schema.json')).toString());
var validator = new Validator({ allErrors: true });
//validator.ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-07.json'));
validator.ajv.addSchema([userSchema, taskSchema]);
var validate = validator.validate;

// Set authentication features
var jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const authErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Authorization error' }] };
app.use(cookieParser());

app.post('/api/users/authenticator', userController.authenticateUser);
app.get('/api/tasks/public', taskController.getPublicTasks);

app.use(
    jwt({
        secret: jwtSecret,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token
    })
);

app.get('/api/tasks', taskController.getUserTasks);
app.post('/api/tasks', validate({ body: taskSchema }), taskController.addTask);
app.get('/api/tasks/:taskId', taskController.getSingleTask);
app.delete('/api/tasks/:taskId', taskController.deleteTask);
app.put('/api/tasks/:taskId', validate({ body: taskSchema }), taskController.updateSingleTask);
app.post('/api/tasks/:taskId/assignees', validate({ body: userSchema }), assignmentController.assignTaskToUser);
app.get('/api/tasks/:taskId/assignees', assignmentController.getUsersAssigned);
app.delete('/api/tasks/:taskId/assignees/:userId', assignmentController.removeUser);
app.post('/api/tasks/assignments', assignmentController.assign);
app.get('/api/users', userController.getUsers);
app.get('/api/users/:userId', userController.getSingleUser);
app.put('/api/tasks/:taskId/:active', taskController.updateTaskActiveStatus)

// Error handlers for validation and authentication errors

app.use(function (err, req, res, next) {
    if (err instanceof ValidationError) {
        res.status(400).send(err);
    } else next(err);
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json(authErrorObj);
    } else next(err);
});


// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});