const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel', // Dynamic ref
        index: true
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['User', 'Shop'],
        default: 'User'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel' // Dynamic ref
    },
    senderModel: {
        type: String,
        enum: ['User', 'Shop'],
        default: 'User'
    },
    type: {
        type: String,
        enum: ['friend_request', 'friend_accept', 'message', 'like', 'comment', 'system', 'order_status', 'new_order'],
        required: true
    },
    // Reference to the related object (e.g., Post, Order, etc.)
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'refModel'
    },
    refModel: {
        type: String,
        enum: ['Post', 'Order', 'User', 'Product']
    },
    text: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fast retrieval of user's notifications sorted by date
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
