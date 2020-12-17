const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader")
const packageDef = protoLoader.loadSync("user.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

const text = process.argv[2]

const client = new grpcObject.user("localhost:9090",grpc.credentials.createInsecure());

console.log(text);

client.login({
    "username" : 'Gianni',
    "password" : 'Gianni'
},(err,response) => {
    console.log("Recived from server "+ JSON.stringify(response))
});
