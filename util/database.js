const mongoDb = require("mongodb");

const mongoClient = mongoDb.MongoClient;

let _db = null;

const mongoConnect = (cb) => {
    mongoClient.connect("mongodb+srv://Narek:096616917n@cluster0-zfrse.mongodb.net/test?retryWrites=true&w=majority",{ useUnifiedTopology: true })
    .then(client => {
        _db = client.db();
        cb()
        console.log("connected");
    }).catch(err => {
        console.log(err)
    })
}

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw "The database not found";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;


