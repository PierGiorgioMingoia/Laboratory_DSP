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

exports.getPublicTasks = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tasks WHERE private = 0";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let tasks = rows.map((row) => createTask(row));
                resolve(tasks);
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
                let tasks = rows.map((row) => createTask(row));
                resolve(tasks);
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
                resolve(task);
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
        const sql = 'INSERT INTO tasks(description, important, private, project, deadline, completed, user) VALUES(?,?,?,?,?,?,?)';
        db.run(sql, [task.description, task.important, task.privateTask, task.project, task.deadline, task.completed, task.user], function (err) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(this.lastID);
                resolve(this.lastID);
            }
        });
    });
}