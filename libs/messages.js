//var express = require("express");

function messages(req) {
    return function(msg, type){
        var type = type || "info";
        var s = req.session.messages;
        s.push({type: type, msg: msg});
    }
}

module.exports = (req, res, next) => {
    var s = req.session;
    s.messages = s.messages || [];

    res.message = messages(req);
    res.error = (msg) => {
        return res.message(msg, "errorMsg");
    };

    res.locals.messages = s.messages;
    res.locals.removeMessages = () => {
        req.session.messages = [];
    };
    next();
};