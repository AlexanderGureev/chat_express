var express = require("express");
var app = express();
var logger = require("morgan");
var fs = require("fs");
var path = require("path");
var favicon = require("express-favicon");
var bodyParser = require("body-parser");
var session = require("express-session");
var csrf = require("csurf");
var MongoStore = require("connect-mongo")(session);

global.Promise = require("bluebird");

var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var VKStrategy = require("passport-vkontakte").Strategy;
var TwitterStrategy = require("passport-twitter").Strategy;

var config = require("./config/oauth");

var LocalStrategy = require("passport-local").Strategy;
var registerController = require("./app/controller/register");
var services = require("./app/controller/register-services");
var authController = require("./app/controller/auth");


var router = require("./routes/router");
var messages = require("./libs/messages");
var db = require("./config/instanceDB");

var sessionStore = new MongoStore({ mongooseConnection: db.connection });
var sessionOptions = {
    resave: false,
    saveUninitialized: false,
    secret: "chatersCookies10",
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: sessionStore
};

app.set("port", process.env.PORT || 8080);
app.set("views", path.join(__dirname, "app/views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.static(__dirname + "/public"));
app.use(favicon(__dirname + "/public/favicon.png"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session(sessionOptions));
app.use(csrf());

app.use(passport.initialize());
app.use(passport.session());

app.use(messages);

passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    state: true
  }, services.googleRegister ));

passport.use(new VKStrategy({
    clientID: config.vk.clientId,
    clientSecret: config.vk.clientSecret,
    callbackURL: config.vk.callbackURL,
    state: true
}, services.vkRegister ));

passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackURL,
    includeEmail: true,
    state: true
}, services.twitterRegister ));


app.get("/auth/vkontakte", router);
app.get("/auth/vkontakte/callback", router);

app.get("/auth/google", router);
app.get("/auth/google/callback", router);

app.get("/auth/twitter", router);
app.get("/auth/twitter/callback", router);

passport.use("register", new LocalStrategy({
    passReqToCallback: true
},  registerController));


passport.use("auth", new LocalStrategy({
    passReqToCallback: true
},  authController));


app.get("/", router);
app.get("/chat", router);
app.get("/logout", router);

app.get("/forgot", router);
app.get("/reset/:token", router);
app.get("/changePassword", router);

app.post("/forgot", router);
app.post("/reset", router);
app.post("/changePassword", router);

app.post("/auth", router);
app.post("/register", router);
app.post("/profile/avatar/add", router);
app.post("/profile/avatar/del", router);
app.post("/profile/status", router);

sessionStore.on("create", (sessionId) => {
    console.log("New session created: " + sessionId);
});

sessionStore.on("destroy", (sessionId) => {
    console.log("Session deleted: " + sessionId);
});

app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') {
        return next(err);
    }
    console.log("invalid csrf token");
    res.status(403).send('Invalid csrf token');
});

app.use((err, req, res, next) => {
    console.error(err);
    return res.status(500).send("Iternal Server Error. Try it again");
});

module.exports = app;
