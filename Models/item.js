const mongoose = require("mongoose");

const ItemData = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    Brand: {
        type: String,
        required: true,
    },
    Available: {
        type: String,
        required: true,
    },
    reviewCount: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    description: {
        type: [String],
        required: true,
    },
    imageUrl: {
        type: [String],
        required: true,
    }
})

module.exports = mongoose.model("items", ItemData);