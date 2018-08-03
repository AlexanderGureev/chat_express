const user = encodeURIComponent("chaterAdmin");
const password = encodeURIComponent("ajuNbS2909MXi");
const database = "chaterDB";

const url = `mongodb://${user}:${password}@localhost:27017/${database}`;

module.exports = {
    url: url,
    dbName: database
}

