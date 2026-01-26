const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username cannot exceed 20 characters'],
        match: [/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, underscore and period'],
        validate: {
            validator: function (v) {
                // Cannot start or end with . or _
                return !v.startsWith('.') && !v.startsWith('_') &&
                    !v.endsWith('.') && !v.endsWith('_') &&
                    // Cannot have consecutive special characters
                    !v.includes('..') && !v.includes('__') &&
                    !v.includes('._') && !v.includes('_.');
            },
            message: 'Username format is invalid'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include password in queries by default
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[\d\s\-\+\(\)]{10,15}$/, 'Please enter a valid phone number']
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
        type: String,
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    profileImage: {
        url: String, // Cloudinary URL
        publicId: String // Cloudinary public ID for deletion
    },
    role: {
        type: String,
        enum: ['user', 'shop_owner', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAt: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // ============ SOCIAL/FRIEND SYSTEM FIELDS ============
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    sentFriendRequests: [{
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    privacy: {
        profileVisibility: {
            type: String,
            enum: ['public', 'friends', 'private'],
            default: 'public'
        },
        postVisibility: {
            type: String,
            enum: ['public', 'friends', 'private'],
            default: 'friends'
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Index for faster queries (only non-unique fields)
userSchema.index({ role: 1 });
userSchema.index({ friends: 1 });
userSchema.index({ 'friendRequests.from': 1 });
userSchema.index({ 'sentFriendRequests.to': 1 });
userSchema.index({ isOnline: 1 });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
        phone: this.phone,
        profileImage: this.profileImage?.url,
        role: this.role,
        isVerified: this.isVerified,
        bio: this.bio,
        location: this.location,
        friendsCount: this.friends?.length || 0,
        isOnline: this.isOnline,
        lastSeen: this.lastSeen,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('User', userSchema);
