const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopName: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true
    },
    shopUsername: {
        type: String,
        required: [true, 'Shop username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Shop username must be at least 3 characters'],
        maxlength: [20, 'Shop username cannot exceed 20 characters'],
        match: [/^[a-zA-Z0-9_.]+$/, 'Shop username can only contain letters, numbers, underscore and period']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        default: 'clothes',
        enum: ['clothes']
    },
    businessType: {
        type: String,
        required: [true, 'Business type is required'],
        enum: ['individual', 'small_business', 'brand', 'reseller']
    },

    // Contact Information
    email: {
        type: String,
        required: [true, 'Contact email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    website: {
        type: String,
        trim: true
    },

    // Location
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    country: {
        type: String,
        required: [true, 'Country is required']
    },
    zipCode: {
        type: String
    },

    // Images (Cloudinary)
    logo: {
        url: String,
        publicId: String
    },
    banner: {
        url: String,
        publicId: String
    },

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    // Stats (cached for performance)
    stats: {
        totalSales: {
            type: Number,
            default: 0
        },
        totalOrders: {
            type: Number,
            default: 0
        },
        totalProducts: {
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

// Indexes (only non-unique fields)
shopSchema.index({ ownerId: 1 });
shopSchema.index({ city: 1 });
shopSchema.index({ isActive: 1 });
shopSchema.index({ 'stats.rating': -1 });

module.exports = mongoose.model('Shop', shopSchema);
