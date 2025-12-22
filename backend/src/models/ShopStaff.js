const mongoose = require('mongoose');

const shopStaffSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    role: {
        type: String,
        enum: ['admin', 'manager', 'staff'],
        default: 'staff'
    },
    permissions: [{
        type: String,
        enum: [
            'manage_products',
            'manage_orders',
            'manage_staff',
            'view_analytics',
            'manage_settings',
            'respond_to_messages'
        ]
    }],

    isActive: {
        type: Boolean,
        default: true
    },
    invitedAt: {
        type: Date,
        default: Date.now
    },
    joinedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound unique index
shopStaffSchema.index({ shopId: 1, userId: 1 }, { unique: true });

// Additional indexes
shopStaffSchema.index({ shopId: 1 });
shopStaffSchema.index({ userId: 1 });

module.exports = mongoose.model('ShopStaff', shopStaffSchema);
