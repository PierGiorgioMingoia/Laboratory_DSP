'use strict';

const Task = require('./task');
const db = require('./db');
const moment = require('moment');


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
        const sql = "SELECT  T.id, T.description, T.important, T.private, T.project, T.deadline, T.completed FROM assignments as A, tasks as T WHERE T.id = A.task AND A.user =?"
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err)
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
    })
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
                const task = new Task(rows[0]);
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
            else {
                deleteAssignedUsers(id);
                resolve(null);
            }
        })
    });
}

exports.createTask = function (task) {
    console.log(task.important)
    if (task.deadline) {
        task.deadline = moment(task.deadline).format("YYYY-MM-DD HH:mm");
    }
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO tasks(description, important, private, project, deadline, completed) VALUES(?,?,?,?,?,?)';
        db.run(sql, [task.description, task.important, task.private, task.project, task.deadline, task.completed], function (err) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(this.lastID);
                if (task.assignedTo && task.assignedTo.length > 0) {
                    saveAssigendUsers(task.assignedTo, this.lastID)
                }
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

const deleteAssignedUsers = (task_id) => {
    const sql = 'DELETE FROM assignments WHERE task = ?'
    db.run(sql, [task_id])
}

exports.updateTask = function (id, newTask) {
    if (newTask.deadline) {
        newTask.deadline = moment(newTask.deadline).format("YYYY-MM-DD HH:mm");
    }
    deleteAssignedUsers(id);
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE tasks SET description = ?, important = ?, private = ?, project = ?, deadline = ?, completed = ? WHERE id = ?';
        db.run(sql, [newTask.description, newTask.important, newTask.private, newTask.project, newTask.deadline, newTask.completed, id], (err) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                saveAssigendUsers(newTask.assignedTo, id);
                resolve(null);
            }
        })
    });
}