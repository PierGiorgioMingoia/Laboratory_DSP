const db = require('./db');
const fs = require('fs')
const uploads_path = './uploads/'



const deleteImagePath = (image) => {
    /*image = {id, taskId}*/
    return new Promise((resolve, reject) => {
        const sql = "SELECT image FROM images WHERE id = ? AND taskId = ? ";
        db.all(sql, [image.id, image.taskId], (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                file_path = rows[0].image;
                try {
                    fs.unlinkSync(uploads_path + file_path)
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        })
    });
}




exports.createImage = function (file) {
    /* file = {filename, type, taskId} */
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO images(taskId, mediaType, image) VALUES(?,?,?)';
        db.run(sql, [file.taskId, file.type, file.filename], function (err) {
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


exports.deleteImage = async function (image) {
    /*image = {id, taskId}*/
    console.log(image);
    await deleteImagePath(image)
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM images WHERE id=? AND taskId=?';
        db.run(sql, [image.id, image.taskId], function (err) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

