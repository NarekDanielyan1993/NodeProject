const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ordersSchema = new Schema({
    products: [
        {
            product: {
                type: Object, 
                required: true
            }, 
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    }
})

module.exports = mongoose.model("Order", ordersSchema)