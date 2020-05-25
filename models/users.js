const getDB = require("../util/database").getDb;
const MongoDB = require("mongodb");
const ObjectId = MongoDB.ObjectId;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// class Users {
//     constructor(name, email, id, cart) {
//         this.name = name;
//         this.email = email;
//         this._id = id,
//         this.cart = cart ? cart : {items:[]}
//     }

//     save() {
//       const db = getDB();
//       db.collection("users").insertOne(this)
//     }

//     static findById(id) {
//       const db = getDB();
//       return db.collection("users").find({_id: new MongoDB.ObjectId(id)})
//       .next()
//       .then((result) => {
//         return result;
//       }) 
//       .catch((err) => {
//         console.log(err)
//       })
//     }

//     addToCart(product) {
//         const db = getDB();
//         const newQuantity = 1;
//         let updatedCart;
//         if(this.cart.items.length <= 0) {
//             updatedCart = {items: [{productId: new MongoDB.ObjectId(product._id), quantity: newQuantity}]}
//         }
//         if(this.cart.items.length > 0) {
//             let updatedCartItems = this.cart.items;
//             let updatedCartIndex = updatedCartItems.findIndex(item => {
//                  return item.productId.toString() === product._id.toString()
//             })
//             if(updatedCartIndex >= 0) {
//               updatedCartItems[updatedCartIndex].quantity += 1;
//             } else {
//                 updatedCartItems.push({productId: new MongoDB.ObjectId(product._id), quantity: newQuantity}) 
//             }
//             updatedCart = {items: updatedCartItems}
//         } 
//         return db.collection("users").updateOne({_id: new MongoDB.ObjectId(this._id)}, {$set: {cart: updatedCart}})
//     }


//     deleteItemFromCart(id) {
//         const db = getDB();
//         const updatedCart = this.cart.items.filter(item => {
//             return item.productId.toString() !== id.toString();
//         })
//         return db.collection("users").updateOne({_id: new MongoDB.ObjectId(this._id)}, {$set: {cart: {items: updatedCart}}})
//         .then(result => {
//             return result;
//         }) 
//         .catch(err => {
//             console.log(err);
//             return err;
//         })    
//     }

//     addToOrder() {
//         const db = getDB();
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: this._id,
//                         name: this.name
//                     }
//                 }
//                 return db.collection("orders").insertOne(order)
//                 .then(result => {                       
//                     this.cart = [];
//                     return db.collection("users").updateOne({_id: new MongoDB.ObjectId(this._id)}, {$set: {cart: {items: []}}})
//                     .then(result => {
//                         return result;
//                     }) 
//                     .catch(err => {
//                         console.log(err);
//                         return err;
//                     })    
//                 })
//             })
//     }

//     getOrders() {
//         const db = getDB();
//         return db.collection("orders").find({"user._id": new ObjectId(this._id)})
//         .toArray()
//         .then(result => {
//             return result;
//         }) 
//         .catch(err => {
//             console.log(err)
//         })                                           
//     }
// }                                                      

const usersSchema = new Schema({                       
    email: {
        type: String,
        required: true                                 
    },
    password: {
        type: String,
        required: true
    },
    token: String,
    expirationToken: Date,
    cart: {
        items: [
            {
                productId: {type: Schema.Types.ObjectId, ref: "Product", required: true},
                quantity: {type: Number, required: true}
            }
        ]
    }
})

usersSchema.methods.clearCart = function() {
    this.cart = {items: []}
    this.save()
}

usersSchema.methods.addToOrder = function() {
    return this.populate("cart.items.productId")
    .execPopulate()
    .then(products => {                                   
        return products.cart.items.map(product => {
            return {
                product: {...product.productId._doc},
                quantity: product.quantity
            }
        })
    })
}

usersSchema.methods.deleteItemFromCart = function(productId) {
    const updatedItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString())
    this.cart.items = updatedItems;
    return this.save()
}

usersSchema.methods.addToCart = function(product) {
    const newQuantity = 1;
    let updatedCartItems = [...this.cart.items];    
    let CartProductIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === product._id.toString()
    }) 
    if(CartProductIndex >= 0) {
        updatedCartItems[CartProductIndex].quantity += 1;
    } else {
        updatedCartItems.push({productId: product._id, quantity: newQuantity})
    } 
    const updatedCart = {
        items: updatedCartItems
    }
    this.cart = updatedCart;
    return this.save()
}

module.exports = mongoose.model("User", usersSchema);

