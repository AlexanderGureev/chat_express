var app = require("../index");
var server = require("http").Server(app);
var io = require("socket.io")(server);
var usersRepository = require("../libs/users");

//var User = require("../app/model/user");
var db = require("../config/instanceDB");


io.on("connection", (socket) => {

    usersRepository.addUsers(socket);

    socket.broadcast.emit("updateOnline", { online: usersRepository.getCountUsers() });
    socket.broadcast.emit("newUser", {
        text: "user - ",
        id: [socket.id]
    });

    console.log("----------------------")
    console.log(`a user connect: ${socket.id}`);
    console.log("----------------------")

    socket.emit("getAllOnlineUsers", {
        text: "user - ",
        count: usersRepository.getCountUsers(),
        id: usersRepository.getAllIdUsers()
    });


    socket.on("send message", (data) => {
        console.log("Message: " + data.message);

        socket.broadcast.emit("message", {
            message: data.message,
            id: socket.id
        });
    });

    socket.on("disconnect", () => {
        console.log("----------------------")
        console.log(`a user disconected: ${socket.id}`);
        console.log("----------------------")

        usersRepository.deleteUsers(socket);
        
        socket.broadcast.emit("updateOnline", { online: usersRepository.getCountUsers() });
        io.sockets.emit("userDisconnect", socket.id);
    });

});

server.listen(app.get("port"), () => {
    console.log(`Application starts`);
});