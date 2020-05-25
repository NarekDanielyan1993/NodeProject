const getDb = require("../util/database").getDb;
const MongoDb = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// module.exports = class Product {
//   constructor(id, url, t, p, d, userId) {
//     this._id = (id ? new MongoDb.ObjectId(id) : null);
//     this.imageUrl = url;
//     this.title = t;
//     this.description = d;
//     this.price = p;
//     this.userId = new MongoDb.ObjectId(userId)
//   }

//   save() {
//       const db = getDb();
//       let dbOp;
//       if(this._id) {
//           dbOp = db.collection("products").updateOne({_id: this._id}, {$set: this})
//       } else {
//           dbOp = db.collection("products").insertOne(this)
//       }
//       return dbOp
//       .then(result => {
//         //console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
  
//   static fetchAll() {
//     const db = getDb();
//     return db.collection("products")
//       .find()
//       .toArray()
//       .then(result => {
//           //console.log(result);
//           return result;
//       })
//       .catch(err => {
//           console.log(err);
//       })
//   }
  
//   static findById(id) {
//     const db = getDb();
//     return db.collection("products").findOne({_id: new MongoDb.ObjectId(id)})
//       .then(result => {
//           //console.log(result);
//           return result;
//       })
//       .catch(err => {
//           console.log(err);
//       })
//   }

//   static deleteById(id) {
//     const db = getDb();
//     return db.collection("products").deleteOne({_id: new MongoDb.ObjectId(id)})
//       .then(result => {
//           console.log("deleted");
//       })
//       .catch(err => {
//           console.log(err);
//       })
//   }
//}

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  }
})

module.exports = mongoose.model("Product", productSchema)    
