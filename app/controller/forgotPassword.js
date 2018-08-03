var User = require("../model/user");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var ejs = require("ejs");
var path = require("path");

var Promise = require("bluebird");
var join = Promise.join;


function validateResetForm(req){
    return (req.body.password === req.body.passwordConfirm && (req.body.password != "" && req.body.passwordConfirm != ""));
}

function sendMail(mailOption) {
    return new Promise((resolve, reject) => {
        var smtpTransport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "gureev.alex95@gmail.com",
                pass: "469090812Ss"
            }
        });

        ejs.renderFile(path.join(__dirname, "../views", mailOption.fileName), mailOption.htmlData, function(err, data){
            if(err) {
                reject(err);
            } else {
                var mailOptions = {
                    to: mailOption.email,
                    from: "chater@admin.ru",
                    subject: mailOption.subject,
                    html: data
                };

                smtpTransport.sendMail(mailOptions, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        var info = JSON.stringify({
                            type: "info",
                            msg: "Сообщение с инструкциями по сбросу пароля отправлены на вашу почту."
                        });
                        resolve(info);
                    }
                });
            }
        });
    });
}

module.exports.forgotPassword = function (req, res, next) {
    
    if(req.body.email === "") {
        var error = JSON.stringify({
            type: "error",
            msg: "Заполните все поля формы"
        });
        res.send(error);
        return;
    }

    Promise.all([
            User.findOne({
                email: req.body.email
            }),
            User.generateResetToken()
        ])
        .then(result => {
            if (result[0]) {
                result[0].resetPasswordToken = result[1];
                result[0].resetPasswordExpires = Date.now() + 3600000;

                return result[0].save();
            } else {
                var error = JSON.stringify({
                    type: "error",
                    msg: "Пользователь с таким email не зарегистрирован."
                });
                res.send(error);
                throw new Error(error.msg);
            }
        })
        .then(user => {
            var mailOptions = {
                username: user.username,
                email: user.email,
                fileName: "emailForgot.ejs",
                subject: "Сброс пароля CHATER.RU",
                htmlData: {
                    username: user.username,
                    url:` http://${req.headers.host}/reset/${user.resetPasswordToken}`
                }
            };
            return sendMail(mailOptions);
        })
        .then(result => {
            return res.send(result);
        })
        .catch(err => {
            console.log(err);
        });

};

module.exports.checkToken = function (req, res) {
    User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        })
        .then(user => {
            if (!user) {
                res.error("Password reset token is invalid or has expired.");
                return res.redirect("/forgot");
            }
            res.render("reset", {
                title: "Сброс пароля",
                user: req.user,
                csrfToken: req.csrfToken()
            });
        })
        .catch(err => {
            console.log(err);
        });
};

module.exports.resetPassword = function (req, res) {
    var token = req.headers.referer.split("/");

    User.findOne({
            resetPasswordToken: token[token.length - 1],
            resetPasswordExpires: {
                $gt: Date.now()
            }
        })
        .then(user => {
            if (!user) {
                res.error("Password reset token is invalid or has expired.");
                return res.redirect("/forgot");
            }
            if (validateResetForm(req)) {
                User.hashPassword(req.body.password)
                    .then(hash => {
                        user.password = hash;
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        return user.save();
                    })
                    .then(user => {
                        req.logIn(user, function (err) {
                            if (err) {
                                var error = JSON.stringify({
                                    type: "error",
                                    msg: "Ошибка аутентификации"
                                });
                                res.send(error);
                                throw new Error(err);
                            }
                            var info = {
                                type: "ok",
                                msg: "/"
                            };
                            return res.send(info);
                        });

                        var mailOptions = {
                            username: user.username,
                            email: user.email,
                            fileName: "emailResetSuccess.ejs",
                            subject: "Пароль изменен CHATER.RU",
                            htmlData: {
                                username: user.username,
                                url:`http://localhost:8080/`
                            }
                        };
                        return sendMail(mailOptions);

                    })
                    .then(result => {
                        return;
                    })
                    .catch(err => {
                        console.log(err);
                    });

            } else {
                var error = JSON.stringify({
                    type: "error",
                    msg: "Форма заполнена некорректно"
                });
                res.send(error);
                throw new Error(error.msg);
            }
        })
        .catch(err =>{
            console.log(err);
        });
};

module.exports.changePassword = function (req, res) {
    User.findById({
            _id: req.user._id
        })
        .then(user => {
            if (!user) {
                res.error("Пользователь не найден.");
                return res.redirect("/changePassword");
            }
            if (validateResetForm(req)) {
                User.hashPassword(req.body.password)
                    .then(hash => {
                        user.password = hash;
                        return user.save();
                    })
                    .then(user => {
                        req.logIn(user, function (err) {
                            if (err) {
                                var error = JSON.stringify({
                                    type: "error",
                                    msg: "Ошибка аутентификации."
                                });
                                res.send(error);
                                throw new Error(err);
                            }
                            var info = {
                                type: "ok",
                                msg: "/"
                            };
                            return res.send(info);
                        });

                        var mailOptions = {
                            username: user.username,
                            email: user.email,
                            fileName: "emailResetSuccess.ejs",
                            subject: "Пароль изменен CHATER.RU",
                            htmlData: {
                                username: user.username,
                                url:`http://localhost:8080/`
                            }
                        };
                        return sendMail(mailOptions);

                    })
                    .then(result => {
                        return;
                    })
                    .catch(err => {
                        console.log(err);
                    });

            } else {
                var error = JSON.stringify({
                    type: "error",
                    msg: "Форма заполнена некорректно."
                });
                res.send(error);
                throw new Error(error.msg);
            }
        })
        .catch(err =>{
            console.log(err);
        });
};