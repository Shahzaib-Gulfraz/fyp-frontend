const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },

    // Basic Information
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters long'],
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Description is required'],
        minlength: [20, 'Description must be at least 20 characters long'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    subcategory: {
        type: String,
        trim: true
    },

    // Pricing
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0.01, 'Price must be greater than 0'],
        validate: {
            validator: function(v) {
                return v > 0;
            },
            message: 'Price must be a positive number'
        }
    },
    compareAtPrice: {
        type: Number,
        min: [0, 'Compare price cannot be negative'],
        validate: {
            validator: function(v) {
                if (v && v > 0) {
                    return v >= this.price;
                }
                return true;
            },
            message: 'Original price must be greater than or equal to selling price'
        }
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },

    // Inventory
    sku: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    stockQuantity: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    isInStock: {
        type: Boolean,
        default: true
    },

    // Product Details
    brand: {
        type: String,
        trim: true
    },
    material: {
        type: String,
        trim: true
    },
    careInstructions: {
        type: String,
        trim: true
    },

    // Dynamic Product Specifications
    specifications: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },

    // Images (Cloudinary)
    thumbnail: {
        url: {
            type: String,
            required: [true, 'Thumbnail is required']
        },
        publicId: String
    },
    images: [{
        url: String,
        publicId: String
    }],

    tryon: {
        type: Boolean,
        default: false
    },
    colors: [String],
    sizes: [String],
    tags: [String],

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },

    // Stats
    stats: {
        viewsCount: {
            type: Number,
            default: 0
        },
        salesCount: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewsCount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes
productSchema.index({ shopId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'stats.rating': -1 });
productSchema.index({ isFeatured: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.compareAtPrice && this.compareAtPrice > this.price) {
        return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
    }
    return 0;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
