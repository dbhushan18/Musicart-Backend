const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        ref: 'items',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
});

const invoicesSchema = new mongoose.Schema({
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    address: {
        type: String,
        required: true,
    },
    paymentMode: {
        type: String,
        enum: ['pay on delivery', 'upi', 'card']
    },
    finalPrice: {
        type: Number,
        required: true,
    },
    cartItems: {
        type: [String],
        required: true,
    },

})


const User = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobNo: {
        type: Number,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    cart: [CartItemSchema],
    invoices: [invoicesSchema],
    feedback: [{
        type: {
            type: String,
            enum: ['bugs', 'feedback', 'query']
        },
        text: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
})

module.exports = mongoose.model("users", User);