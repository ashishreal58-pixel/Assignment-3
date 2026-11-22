const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },

    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },

    category: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    quantity: {
        type: Number,
        required: true,
        min: 0,
        validate: Number.isInteger
    },

    reorderLevel: {
        type: Number,
        required: true,
        min: 0
    },

    supplier: {
        type: String,
        required: true
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

productSchema.virtual("stockValue").get(function() {
    return this.price * this.quantity;
});

module.exports = mongoose.model("Product", productSchema);
