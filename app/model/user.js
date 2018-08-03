var db = require("../../config/instanceDB");
var Joi = require("joi");
var bcrypt = require("bcryptjs");
var crypto = require("crypto");

var userSchema = db.Schema({
    twitterId: String,
    vkId: String,
    googleId: String,
    provider: {
        type: String,
        default: "local"
    },
    email: String,
    username: String,
    password: String,
    profile: {
        status: {
            type: String,
            default: "Сменить статус"
        },
        avatarPath: { 
            type: String, 
            default: "/img/ava_default.png" 
        }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

var userValidateSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    username: Joi.string().regex(/^[а-яёa-z0-9]/i).min(4).max(20).required(),
    password: Joi.string().min(3).max(30).required()
});


var User = db.model("user", userSchema);
module.exports = User;

module.exports.validateUser = (model) => {
    return Joi.validate(model, userValidateSchema);
};

module.exports.hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10)
            .then((salt) => {
                return bcrypt.hash(password, salt);
            })
            .then((hash) => {
                resolve(hash);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

module.exports.checkPassword = (password, user) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password)
            .then((res) => {
                resolve({
                    res: res,
                    user: user
                });
            })
            .catch((err) => {
                reject(err);
            });
    })
};

module.exports.generateResetToken = function() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(50, (err, buf) => {
            if(err){
                reject(err);
            } else {
                resolve(buf.toString("hex"));
            }
        });
    });
};