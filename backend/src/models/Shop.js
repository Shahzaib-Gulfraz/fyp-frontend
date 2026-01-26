const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const shopSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: [true, 'Shop name is required'],
        unique: true,
        trim: true
    },
    shopUsername: {
        type: String,
        required: [true, 'Shop username is required'],
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

    // Authentication & Contact Information
    email: {
        type: String,
        required: [true, 'Shop email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // SEO and Slugs
    seo: {
        slug: {
            type: String,
            lowercase: true,
            trim: true
        },
        metaTitle: String,
        metaDescription: String
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
    hours: {
        Monday: { type: String, default: '9:00 AM - 6:00 PM' },
        Tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
        Wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
        Thursday: { type: String, default: '9:00 AM - 6:00 PM' },
        Friday: { type: String, default: '9:00 AM - 6:00 PM' },
        Saturday: { type: String, default: '10:00 AM - 4:00 PM' },
        Sunday: { type: String, default: 'Closed' }
    },
    social: {
        instagram: String,
        facebook: String,
        twitter: String
    },
    settings: {
        notifications: { type: Boolean, default: true },
        showOnline: { type: Boolean, default: true },
        privateAccount: { type: Boolean, default: false }
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
    },
    followersCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Hash password and generate slug before saving
shopSchema.pre('save', async function () {
    // Generate slug from username if not present
    if (!this.seo || !this.seo.slug) {
        if (!this.seo) this.seo = {};
        this.seo.slug = this.shopUsername ? this.shopUsername.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined;
    }

    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare passwords
shopSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public shop data
shopSchema.methods.toPublicJSON = function () {
    const shop = this.toObject();
    delete shop.password;
    return shop;
};

// Indexes
// Indexes (Email and seo.slug already have unique indexes from schema)
shopSchema.index({ city: 1 });
shopSchema.index({ isActive: 1 });
shopSchema.index({ 'stats.rating': -1 });

module.exports = mongoose.model('Shop', shopSchema);
