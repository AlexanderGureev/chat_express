var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const connectionInfo = require("./db");
mongoose.connect(connectionInfo.url)
    .then(() => {
        console.log("Successfully connected to database chaterDB");
    })
    .catch((error) => {
        throw error;
    });

mongoose.connection.on("disconnected", function () {  
    console.log("Mongoose default connection disconnected"); 
});

process.on("SIGINT", function () {
    mongoose.connection.close(function () {
        console.log("Mongoose default connection disconnected through app termination");
         process.exit(0);
    });
});

module.exports = mongoose;