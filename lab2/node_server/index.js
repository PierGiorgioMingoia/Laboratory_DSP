'use strict'

const express = require('express');
const morgan = require('morgan'); // logging middleware
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 300; //seconds
const path = require('path');
const fs = require('fs');



//lab 2
const grp = require('./src/grpcService');


var dir = path.join(__dirname, 'uploads');

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};


let upload = multer({ storage: storage, fileFilter: imageFilter }).single('images');
//const imageDataStream = fs.createReadStream(pathOriginFile, {highWaterMark: max_chunk_size}); Default chunk size: 665536

//src
const userDao = require('./src/user_dao');
const taskDao = require('./src/task_dao');

//create application
const app = express();
const port = 3001;

//schema validator
const Ajv = require('ajv');
const task_schema = require('./json/task.json')
const user_schema = require('./json/user.json')

const test = require("./json/test.json")


const ajv = new Ajv({ useDefaults: true });
const validate = ajv.compile(task_schema)


/*Error obj*/
const dbError = { errors: [{ 'param': 'Server', 'msg': 'Database error' }] };
const authError = { errors: [{ 'param': 'Server', 'msg': 'Authorization error' }] };

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
const csfrProtection = csrf({
    cookie: { httpOnly: true, sameSite: true }
});

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


// lab 2
app.post('/image', upload, (req, res) => {
    // TODO save image/task in the DB
    if (!req.file) {
        console.log("No File recived");
        return res.send({
            success: false,
        });
    } else {
        console.log("File recived");
        return res.send({
            success: true,
        })
    }
});

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};



app.get('/image/:taskId/:imageId', (req, res) => {
    //TODO check if format is avaiable
    console.log(req.body)
    grp.getImageOfTask(req).then((image) => {
        console.log('BOOMES');
    }).catch((err)=>{
        console.log(err);
    })
   
});

// For the rest of the code, all APIs require authentication

app.use(
    jwt({
        secret: jwtSecret,
        getToken: req => req.cookies.token,
        algorithms: ['HS256']
    })
);

// Provide an endpoint for the App to retrieve the CSRF token
app.get('/api/csrf-token', csfrProtection, (req, res) => {
    console.log(req.csrfToken());
    res.json({ csrfToken: req.csrfToken() });
});

// To return a better object in case of errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json(authError);
    }
});


//GET /tasks/<taskId>
app.get('/tasks/:taskId', (req, res) => {
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

//GET /tasks
app.get('/tasksuser', (req, res) => {
    const user = req.user && req.user.user;
    console.log(user)
    taskDao.getTasks(user)
        .then((tasks) => {
            res.json(tasks);
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{ 'msg': err }],
            });
        });
});



//POST /tasks
app.post('/tasks', (req, res) => {
    const task = req.body;
    if (!task || !validate(task)) {
        res.status(400).end();
    } else {
        console.log(task);
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

//PUT /tasks/<taskId>
app.put('/tasks/:taskId', (req, res) => {
    if (!req.body.id) {
        res.status(400).end();
    } else {
        const task = req.body;
        if (!task || !validate(task)) {
            let er = validate.errors;

            res.status(400).end();
        } else {
            const user = req.user && req.user.user;
            task.user = user;
            taskDao.updateTask(req.params.taskId, task)
                .then((result) => res.status(200).end())
                .catch((err) => res.status(500).json({
                    errors: [{ 'param': 'Server', 'msg': err }],
                }));
        }
    }
});

app.listen(port, () => console.log('Server ready'));

