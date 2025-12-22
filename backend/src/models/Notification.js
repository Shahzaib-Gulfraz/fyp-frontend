const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Notification Details
    type: {
        type: String,
        enum: ['order', 'message', 'review', 'promotion', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },

    // Related entities
    relatedEntityType: {
        type: String,
        enum: ['order', 'product', 'chat', 'shop', 'user']
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId
    },

    // Action
    actionUrl: {
        type: String
    },

    // Status
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });

// Mark as read method
notificationSchema.methods.markAsRead = async function () {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
