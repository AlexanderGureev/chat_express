function userRepository() {

    this.users = [];

    this.addUsers = function (socket) {
        users.push(socket);
    }

    this.deleteUsers = function (socket) {
        var idItem = users.indexOf(socket.id);
        users.splice(idItem, 1);
    }
    this.getCountUsers = function () {
        return this.users.length;
    }
    this.getAllIdUsers = function(){
        return users.map((user) => user.id);
    }

    return this;

}

module.exports = userRepository();