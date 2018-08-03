var db = require("../../config/instanceDB");

var tokensSchema = db.Schema({
    _id: {
        type: db.Schema.Types.ObjectId,
        ref: "users"
    },
    access_token: {
        type: String,
        unique: true
    },
    refresh_token: String,
    created: {
        type: Date,
        default: Date.now()
    }
});

var tokenModel = db.model("accessToken", tokensSchema);

module.exports = tokenModel;