const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    // Variant Attributes
    size: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        trim: true
    },
    colorHex: {
        type: String,
        match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color code']
    },

    // Pricing
    priceAdjustment: {
        type: Number,
        default: 0
    },

    // Inventory
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    stockQuantity: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },

    // Image (Cloudinary) - if variant has specific image
    image: {
        url: String,
        publicId: String
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
productVariantSchema.index({ productId: 1 });
productVariantSchema.index({ size: 1 });
productVariantSchema.index({ color: 1 });

// Compound index for common queries
productVariantSchema.index({ productId: 1, size: 1, color: 1 });

module.exports = mongoose.model('ProductVariant', productVariantSchema);
