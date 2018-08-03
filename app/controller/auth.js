var passport = require("passport");
var User = require("../model/user");

module.exports = function(req, username, password, done) {

    User.findOne({
        username: username
    }) /*?*/ 
    .then((user) => {
        if(user){
            return User.checkPassword(password, user); 
        }
        else {
            var error = {
                type: "error",
                msg: "Пользователя с таким именем не существует."
            };
            done(error);
            throw new Error("Пользователя с таким именем не существует.");
        }
    })
    .then((resObj) => {
        if(resObj.res){
            var info = {
                type: "ok",
                msg: "/"
            };
            return done(null, resObj.user, info);
        }
        else {
            var error = {
                type: "error",
                msg: "Неверный пароль." 
            };
            return done(error);
        }
    })
    .catch((err) => {
        console.log(err);
        return;
    });
};