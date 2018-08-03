var passport = require("passport");
var User = require("../model/user");
var TokenModel = require("../model/authTokens");
var request = require("request-promise");
var path = require("path");


function vkApi(methodName, param, accessToken) {
    return new Promise((resolve, reject) => {
        var options = {
            uri: `https://api.vk.com/method/${methodName}?${param}&access_token=${accessToken}&v=5.78`
        };
        request(options)
            .then(response => {
                resolve(JSON.parse(response));
            })
            .catch(err => {
                reject(err);
            });
    })
}

module.exports.googleRegister = function(accessToken, refreshToken, profile, done) {
    var at = accessToken;
    var rt = refreshToken;
    //console.log(profile._json);

    // var options = {
    //     uri: "https://www.googleapis.com/oauth2/v3/tokeninfo",
    //     qs: {
    //         access_token: at
    //     }
    // };
    // request(options)
    //     .then(responce => {
    //         console.log(responce);
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });

    User.findOne({
            googleId: profile.id
        })
        .then(user => {
            if (user) {
                return done(null, user);
            } else {
                User.findOne({
                        email: profile.emails[0].value
                    })
                    .then(user => {
                        if (user) {
                            var error = {
                                type: "error",
                                msg: "Email уже используется."
                            };
                            done(error);
                            throw new Error("Email уже используется.");
                        } else {
                            var user = new User({
                                googleId: profile.id,
                                provider: profile.provider,
                                username: profile.displayName,
                                email: profile.emails[0].value,
                                "profile.avatarPath": profile.photos ?
                                            profile.photos[0].value.split("?sz=50")[0] + "?sz=250" : undefined
                            });
                            var accessToken = new TokenModel({
                                _id: user._id,
                                access_token: at,
                                refresh_token: rt,
                                created: Date.now()
                            });

                            return Promise.all([
                                user.save(),
                                accessToken.save()
                            ]);
                        }
                    })
                    .then(res => {
                        return done(null, res);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
        .catch(err => {
            console.log(err);
            return done(err);
        });
    }

module.exports.vkRegister = function(accessToken, refreshToken, params, profile, done) {
    var at = accessToken;
    var rt = refreshToken;
    // console.log(profile._json);
    // console.log(params);

    vkApi("users.get", `user_ids=${profile.id}&fields=photo_200`, accessToken)
        .then(res => console.log(res.response[0].photo_200));


    User.findOne({ vkId: profile.id })
        .then(user => {
            if (user) {
                return done(null, user);
            } else {
                User.findOne({ email: params.email })
                    .then(user => {
                        if (user) {
                            var error = {
                                type: "error",
                                msg: "Email уже используется."
                            };
                            done(error);
                            throw new Error("Email уже используется.");
                        } else {
                            var user = new User({
                                vkId: profile.id,
                                provider: profile.provider,
                                username: profile.displayName,
                                email: params.email ?
                                       params.email : undefined
                            });
                            var accessToken = new TokenModel({
                                _id: user._id,
                                access_token: at,
                                refresh_token: rt,
                                created: Date.now()
                            });

                            return Promise.all([
                                user.save(),
                                accessToken.save()
                            ]);
                        }
                    })
                    .then(res => {
                        return Promise.all([
                            Promise.resolve(res[0]),
                            vkApi("users.get", `user_ids=${profile.id}&fields=photo_200`, accessToken)
                        ])
                    })
                    .then(res => {
                        res[0].profile.avatarPath = res[1].response[0].photo_200;
                        return res[0].save();
                    })
                    .then(user => {
                        return done(null, user);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
        .catch(err => {
            console.log(err);
            return done(err);
        });
    }

module.exports.twitterRegister = function (accessToken, refreshToken, profile, done) {
    var at = accessToken;
    var rt = refreshToken;
    //console.log(profile._json);

    User.findOne({ twitterId: profile.id })
        .then(user => {
            if (user) {
                return done(null, user);
            } else {
                User.findOne({ email: profile._json.email })
                    .then(user => {
                        if (user) {
                            var error = {
                                type: "error",
                                msg: "Email уже используется."
                            };
                            done(error);
                            throw new Error("Email уже используется.");
                        } else {
                            var user = new User({
                                twitterId: profile.id,
                                provider: profile.provider,
                                username: profile.displayName,
                                email: profile._json.email,
                                "profile.avatarPath": profile._json.profile_image_url_https ? 
                                            profile._json.profile_image_url_https.split("_normal")[0] + path.extname(profile._json.profile_image_url_https) : undefined
                            });
                            var accessToken = new TokenModel({
                                _id: user._id,
                                access_token: at,
                                refresh_token: rt,
                                created: Date.now()
                            });

                            return Promise.all([
                                user.save(),
                                accessToken.save()
                            ]);
                        }
                    })
                    .then(res => {
                        return done(null, res);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
        .catch(err => {
            console.log(err);
            return done(err);
        });
}