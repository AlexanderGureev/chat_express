var db = require("../../config/instanceDB");
var User = require("../model/user");
var multer = require("multer");
var path = require("path");
var del = require("del");

var pathStore = "public/img/uploads";

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pathStore);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

var upload = multer({ 
    storage: storage, 
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
            return callback(new Error('Only images are allowed'));
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
}).single("avatar");

function updateAvatar(userId, filePath) {
    return new Promise((resolve, reject) => {
        User.findByIdAndUpdate(userId, { $set: { "profile.avatarPath": filePath } }, { new: true })
        .then(user => {
            resolve(user.profile.avatarPath);
        })
        .catch(err => {
            reject(err);
        });
    });
}

function deleteAvatar(userId, filePath) {
    return new Promise((resolve, reject) => {
        User.findByIdAndUpdate(userId, { $set: { "profile.avatarPath": filePath } })
        .then(user => {
            return del(["public" + user.profile.avatarPath]);
        })
        .then(delFile => {
            resolve(delFile);
        })
        .catch(err => {
            reject(err);
        });
    });
}

module.exports.upload = upload;

module.exports.addAvatar = function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            var result = JSON.stringify({
                type: "error",
                msg: err.message
            });
            return res.send(result);

        } else {
            updateAvatar(req.user._id, "/img/uploads/" + `${req.file.filename}`)
                .then(avatarPath => {
                    var result = JSON.stringify({
                        type: "ok",
                        avatarPath: avatarPath
                    });
                    return res.send(result);
                })
                .catch(err => {
                    console.log(err);
                    return;
                });
        }
    });
};

module.exports.delAvatar = function(req, res, next) {
    deleteAvatar(req.user._id, "/img/ava_default.png")
        .then(delFile => {
            console.log("file delete: " + delFile);
            
            var result = JSON.stringify({
                avatarPath: "/img/ava_default.png"
            });
            res.send(result);
        })
        .catch(err => {
            console.log(err);
        });
};

module.exports.setStatus = function(req, res, next) {
    User.findById({_id: req.user._id})
        .then(user => {
            user.profile.status = req.body.status;
            return user.save();
        })
        .then(user => {
            var info = JSON.stringify({
                type: "ok",
                msg: `${user.profile.status}`
            });
            return res.send(info);
        })
        .catch(err => {
            var error = JSON.stringify({
                type: "error",
                msg: "Ошибка загрузки, попробуйте снова"
            });
            console.log(err);
            return res.send(error);
        })
};