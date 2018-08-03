var express = require("express");
var app = require("../index");
var router = express.Router();
var passport = require("passport");
var usersRepository = require("../libs/users");
var User = require("../app/model/user");

var profileController = require("../app/controller/profile");
var passController = require("../app/controller/forgotPassword");

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


var getUserInfo = function (req) {
    var user = {};

    if (req.isAuthenticated()) {
        user = {
            name: req.user.username,
            email: req.user.email,
            mobile: " - ",
            avatarPath: req.user.profile.avatarPath,
            status: req.user.profile.status,
            provider: req.user.provider
        };
    }
    return user;
};

var isLocalRegister = function(req, res, next) {
    if(req.user.provider === "local") {
        return next();
    }
    res.error("Смена пароля не доступна при входе через социальные сети.");
    return res.redirect("/");
};

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
};

router.get("/", (req, res) => {
    res.render("index", {
        title: "Home",
        csrfToken: req.csrfToken(),
        isAuthenticated: req.isAuthenticated(),
        user: getUserInfo(req)
    });
});

router.get("/forgot", (req, res) => {
    res.render("forgot", {
        title: "Forgot password",
        csrfToken: req.csrfToken(),
    });
});

router.get("/changePassword", isAuthenticated, isLocalRegister, function(req, res) {
    res.render("changePassword", {
        title: "Change password",
        csrfToken: req.csrfToken()
    });
});

router.get("/reset/:token", passController.checkToken);

router.post("/reset", passController.resetPassword);

router.post("/changePassword", isAuthenticated, isLocalRegister, passController.changePassword);

router.post("/forgot", passController.forgotPassword);

router.get("/chat", isAuthenticated, function (req, res) {
    res.render("chat", {
        title: "Chat",
        online: usersRepository.getCountUsers()
    });
});

router.get("/logout", function (req, res, next) {
    req.logout();
    req.session.destroy((err) => {
        if(err){
            next(err);
        }
    });
    res.redirect("/");
});


router.get("/auth/google",
    passport.authenticate("google", {
        scope: ["https://www.googleapis.com/auth/plus.login",
                "https://www.googleapis.com/auth/plus.profile.emails.read"
        ]
    }));

router.get("/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", function (err, user, info) {
        if(err) {
            if(err.type){
                res.error("Email уже используется.");
                return res.redirect("/");
            }
            else {
                return next(err);
            }
        }
        if (!user) {
            return next(new Error("User not found"));
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect("/");
        });
    })(req, res, next);
});

router.get("/auth/vkontakte",
    passport.authenticate("vkontakte", {
        scope: ["status", "email", "photos"],
    }));

router.get("/auth/vkontakte/callback", (req, res, next) => {
    passport.authenticate("vkontakte", function (err, user, info) {
        if(err) {
            if(err.type){
                res.error("Email уже используется.");
                return res.redirect("/");
            }
            else {
                return next(err);
            }
        }
        if (!user) {
            return next(new Error("User not found"));
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect("/");
        });
    })(req, res, next);
});

router.get("/auth/twitter", passport.authenticate("twitter"));
router.get("/auth/twitter/callback", (req, res, next) => {
    passport.authenticate("twitter", function (err, user, info) {
        if(err) {
            if(err.type){
                res.error("Email уже используется.");
                return res.redirect("/");
            }
            else {
                return next(err);
            }
        }
        if (!user) {
            return next(new Error("User not found"));
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect("/");
        });
    })(req, res, next);
});

router.post("/auth", (req, res, next) => {
    passport.authenticate("auth", function(err, user, info) {
        if(err) {
            if(err.type == "error"){
                return res.send(JSON.stringify(err));
            }
            else {
                return next(err);
            }
        }
        if(!user) {
            var error = JSON.stringify({
                type: "error",
                msg: "Заполните все поля формы"
            });
            res.send(error);
            return next(new Error("User not found"));
        }
        req.logIn(user, function(err) {
            if(err) {
                return next(err);
            }
            return res.send(JSON.stringify(info));
        });

    })(req, res, next);
});

router.post("/register", (req, res, next) => {
    passport.authenticate("register", function(err, user, info) {
        if(err) {
            if(err.type){
                return res.send(JSON.stringify(err));
            }
            else {
                return next(err);
            }
        }
        if(!user) {
            var error = JSON.stringify({
                type: "error",
                msg: "Заполните все поля формы"
            });
            res.send(error);
            return next(new Error("User not found"));
        }
        req.logIn(user, function(err) {
            if(err) {
                return next(err);
            }
            return res.send(JSON.stringify(info));
        });

    })(req, res, next);
});

router.post("/profile/avatar/add", profileController.addAvatar);
router.post("/profile/avatar/del", profileController.delAvatar);

router.post("/profile/status", profileController.setStatus);


module.exports = router;