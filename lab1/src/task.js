class Task{    
    constructor(row) {
        this.id = row.id;
        this.description =row.description
        this.important = row.important
        this.private = row.private
        this.project = row.project
        this.deadline = row.deadline
        this.completed = row.completed
        this.assignedTo = []
    }
}

module.exports = Task;
