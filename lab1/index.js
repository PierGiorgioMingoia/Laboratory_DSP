'use strict'

const express = require('express');
const morgan = require('morgan'); // logging middleware
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 300; //seconds



//src
const userDao = require('./src/user_dao');
const taskDao = require('./src/task_dao');

//create application
const app = express();
const port = 3001;

//schema validator
const validate = require('jsonschema').validate;
const task_schema = require('./json/task.json')
const user_schema = require('./json/user.json')

const test = require("./json/test.json")

function validate_json(json_data, schema) {
    const val = validate(json_data, schema)
    return val.errors.length == 0 ? true : false
}

try {
    validate(test, task_schema, { "throwError": true })
} catch (error) {
    console.log(error)
}

// Set-up logging
app.use(morgan('tiny'));

// Process body content
app.use(express.json());


// Authentication endpoint
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    userDao.getUser(username)
        .then((user) => {

            if (user === undefined) {
                res.status(404).send({
                    errors: [{ 'param': 'Server', 'msg': 'Invalid e-mail' }]
                });
            } else {
                if (!userDao.checkPassword(user, password)) {
                    res.status(401).send({
                        errors: [{ 'param': 'Server', 'msg': 'Wrong password' }]
                    });
                } else {
                    //AUTHENTICATION SUCCESS
                    const token = jsonwebtoken.sign({ user: user.id }, jwtSecret, { expiresIn: expireTime });
                    res.cookie('token', token, { httpOnly: true, sameSite: true, maxAge: 1000 * expireTime });
                    res.json({ id: user.id, name: user.name });
                }
            }
        }).catch(

            // Delay response when wrong user/pass is sent to avoid fast guessing attempts
            (err) => {
                new Promise((resolve) => { setTimeout(resolve, 1000) }).then(() => res.status(401).json(authErrorObj))
            }
        );
});

app.use(cookieParser());

app.post('/logout', (req, res) => {
    res.clearCookie('token').end();
});


app.get('/tasks', (req, res) => {
    taskDao.getPublicTasks()
        .then((tasks) => {
            res.json(tasks);
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{ 'msg': err }],
            });
        });
});

// For the rest of the code, all APIs require authentication

app.use(
    jwt({
        secret: jwtSecret,
        getToken: req => req.cookies.token,
        algorithms: ['HS256']
    })
);


//GET /tasks/<taskId>
app.get('/tasks/:taskId', (req, res) => {
    console.log(req.params)
    taskDao.getTask(req.params.taskId)
        .then((course) => {
            if (!course) {
                res.status(404).send();
            } else {
                res.json(course);
            }
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{ 'param': 'Server', 'msg': err }],
            });
        });
});


//POST /tasks
app.post('/tasks', (req, res) => {
    const task = req.body;
    if (!task || !validate_json(task, task_schema)) {
        res.status(400).end();
    } else {
        const user = req.user && req.user.user;
        task.user = user;
        taskDao.createTask(task)
            .then((id) => res.status(201).json({ "id": id }))
            .catch((err) => {
                res.status(500).json({ errors: [{ 'param': 'Server', 'msg': err }], })
            });
    }
});

//DELETE /tasks/<taskId>
app.delete('/tasks/:taskId', (req, res) => {
    console.log(req.params.taskId);
    taskDao.deleteTask(req.params.taskId)
        .then((result) => res.status(204).end())
        .catch((err) => res.status(500).json({
            errors: [{ 'param': 'Server', 'msg': err }],
        }));
});

app.listen(port, () => console.log('Server ready'));

