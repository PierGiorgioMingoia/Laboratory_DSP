
const max_chunk_size = 1024;
const db = require('./db');
const fs = require('fs');
//gRPC
const PROTO_PATH = '../conversion.proto';
const REMOTE_URL = 'localhost:9090';
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const uploads_path = './uploads/'
let packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);
let protoD = grpc.loadPackageDefinition(packageDefinition).conversion;

exports.getImageOfTask = function (req) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id, mediaType, image, taskId FROM images WHERE id = ? AND taskId = ? ";
        db.all(sql, [req.params.imageId, req.params.taskId], (err, rows) => {
            if (err)
                reject(err);
            else {
                console.log(req.params)
                let image;
                if (rows.length > 0) {
                    //req.headers.accept
                    const old_type = rows[0].mediaType;
                    const new_type = req.headers.accept.substr(req.headers.accept.lastIndexOf('/') + 1);

                    if (old_type === new_type) {
                        image = { fileName: rows[0].image, rootName: "./uploads" };
                        resolve(image);
                    }
                    else {
                        //gRPC connection
                        try {
                            const new_filename = 'response_image.' + new_type;

                            let client = new protoD.Converter(REMOTE_URL, grpc.credentials.createInsecure());
                            let channel = client.fileConvert();

                            const imageDataStreamRequest = fs.createReadStream(
                                uploads_path + rows[0].image,
                                { highWaterMark: max_chunk_size }
                            );

                            const imageDataStreamResponse = fs.createWriteStream("./uploads/" + new_filename);

                            const metadataRequest = {
                                file_type_origin: old_type,
                                file_type_target: new_type
                            };


                            // Request
                            channel.write({ meta: metadataRequest });

                            imageDataStreamRequest.on('data', (chunk) => {
                                //send the chunk to the Converter service
                                channel.write({ file: chunk });
                            });

                            imageDataStreamRequest.on('end', () => {
                                channel.end();
                            });


                            // Response
                            let counterMetadataResponses = 0;

                            channel.on('data', (chunk) => {
                                if (chunk.meta !== undefined) {
                                    if (counterMetadataResponses > 0)
                                        reject("Multiple metadata chunks in response");
                                    else
                                        counterMetadataResponses++;
                                    // This is the metadata chunk
                                    let metadataResponse = chunk.meta;
                                    if (metadataResponse.success === false)
                                        reject(metadataResponse.error)
                                }
                                else {
                                    // This is data
                                    imageDataStreamResponse.write(chunk.file);
                                }
                            });


                            channel.on('end', () => {
                                imageDataStreamResponse.end();
                                image = { fileName: new_filename, rootName: "./uploads" };
                                resolve(image);
                            });
                        }
                        catch(error) {
                            console.log(error);
                            reject();
                        }

                    }
                }
                else {
                    reject();
                }
            }
        });
    });
}
