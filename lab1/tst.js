const validate = require('jsonschema').validate;
const task_schema = require('./json/task.json')
const user_schema = require('./json/user.json')

const test = require("./json/test.json")
try {
    console.log(validate(test, task_schema).instance)
} catch (error) {
    console.log(error)
}