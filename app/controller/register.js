var passport = require("passport");
var User = require("../model/user");

module.exports = function(req, username, password, done) {

    var result = User.validateUser(req.body);

    if (result.error) {
        var error = {
            type: "error",
            msg: "Введенные данные не корректны, попробуйте снова."
        };
        return done(error);
    }

    User.findOne({
            email: result.value.email
        })
        .then((user) => {
            if (user) {
                var error = {
                    type: "error",
                    msg: "Email уже используется."
                };
                done(error);
                throw new Error("Email уже используется.");
                
            } else {
                return User.hashPassword(result.value.password);
            }
        })
        .then((password) => {
            result.value.password = password;
            var user = new User(result.value);
            return user.save();
        })
        .then((user) => {
            console.log(`Created new user: \n${user}`);
            var info = {
                type: "ok",
                msg: "/"
            };
            return done(null, user, info);
        })
        .catch((err) => {
            console.log(err);
            return;
        });
};

