const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    // Type of conversation: user-to-user or user-to-shop
    conversationType: {
        type: String,
        enum: ['user-to-user', 'user-to-shop'],
        default: 'user-to-user'
    },
    // Shop reference for shop conversations
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: function () {
            return this.conversationType === 'user-to-shop';
        }
    },
    lastMessage: {
        text: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: Date,
        isRead: {
            type: Boolean,
            default: false
        }
    },
    // Track unread messages for each participant
    // Key: userId, Value: count
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true
});

// Index to quickly find conversations for a user
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 }); // For sorting list by recent activity
conversationSchema.index({ shopId: 1, participants: 1 }); // For shop conversations

module.exports = mongoose.model('Conversation', conversationSchema);
