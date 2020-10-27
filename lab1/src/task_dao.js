'use strict';

const Task = require('./task');
const db = require('./db');
const moment = require('moment');


const createTask = function (row) {
    const importantTask = (row.important === 1) ? true : false;
    const privateTask = (row.private === 1) ? true : false;
    const completedTask = (row.completed === 1) ? true : false;
    return new Task(row.tid, row.description, importantTask, privateTask, row.deadline, row.project, completedTask, row.email);
}

const getTaskUsers = function (task_id) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT user FROM assignments where task = ? "
        db.all(sql, [task_id], (err, rows) => {
            if (err) {
                reject(err)
            } else {
                let assignedTo = rows.map(row => row.user)
                resolve(assignedTo);
            }
        });
    })


}

exports.getPublicTasks = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tasks WHERE private = 0";
        db.all(sql, [], async (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let tasks = rows.map((row) => new Task(row));
                const promises = tasks.map((t) => {
                    return getTaskUsers(t.id).then((users) => {
                        t.assignedTo = [...users];
                        return t;
                    });
                });
                Promise.all(promises).then((result) => {
                    resolve(result);
                })

            }
        });
    });
}


exports.getTasks = function (user) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * WHERE user = ?";
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let tasks = rows.map((row) => new Task(row));
                const promises = tasks.map((t) => {
                    return getTaskUsers(t.id).then((users) => {
                        t.assignedTo = [...users];
                        return t;
                    });
                });
                Promise.all(promises).then((result) => {
                    resolve(result);
                })
            }
        });
    });
}

/**
 * Get a task with given 
 */
exports.getTask = function (id) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tasks WHERE id = ?";
        db.all(sql, [id], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                const task = createTask(rows[0]);
                getTaskUsers(task.id).then((users) => {
                    task.assignedTo = [...users];
                    resolve(task);
                })
            }
        });
    });
}

/**
 * Delete a task with a given id
 */
exports.deleteTask = function (id) {
    console.log(id);
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM tasks WHERE id = ?';
        db.run(sql, [id], (err) => {
            if (err)
                reject(err);
            else
                resolve(null);
        })
    });
}

exports.createTask = function (task) {
    if (task.deadline) {
        task.deadline = moment(task.deadline).format("YYYY-MM-DD HH:mm");
    }
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO tasks(description, important, private, project, deadline, completed) VALUES(?,?,?,?,?,?,?)';
        db.run(sql, [task.description, task.important, task.privateTask, task.project, task.deadline, task.completed], function (err) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(this.lastID);
                saveAssigendUsers(task.assignedTo, this.lastID)
                resolve(this.lastID);
            }
        });
    });
}

const saveAssigendUsers = (users, task_id) => {
    users.forEach(user => {
        const sql = 'INSERT INTO assignments(task,user) VALUES(?,?)'
        db.run(sql, [task_id, user]);
    });
}