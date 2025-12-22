const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant'
    },

    // Item Details (snapshot at time of order)
    productName: {
        type: String,
        required: true
    },
    variantDetails: {
        size: String,
        color: String,
        colorHex: String
    },

    // Pricing
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },

    // Product snapshot
    productImage: {
        url: String
    }
}, {
    timestamps: true
});

// Indexes
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ productId: 1 });

// Calculate subtotal before saving
orderItemSchema.pre('save', function (next) {
    this.subtotal = this.unitPrice * this.quantity;
    next();
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
