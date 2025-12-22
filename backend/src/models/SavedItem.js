const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate saves
savedItemSchema.index({ userId: 1, productId: 1, variantId: 1 }, { unique: true });

// Additional indexes
savedItemSchema.index({ userId: 1 });
savedItemSchema.index({ productId: 1 });
savedItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SavedItem', savedItemSchema);
