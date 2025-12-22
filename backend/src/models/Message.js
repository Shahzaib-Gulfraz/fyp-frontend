const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Message Content
    content: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'product', 'order'],
        default: 'text'
    },

    // Attachments (Cloudinary URLs or references)
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'product', 'order']
        },
        url: String,
        publicId: String,
        referenceId: mongoose.Schema.Types.ObjectId // For product or order references
    }],

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
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ isRead: 1 });

// Update chat's last message when a new message is created
messageSchema.post('save', async function () {
    const Chat = mongoose.model('Chat');
    await Chat.findByIdAndUpdate(this.chatId, {
        lastMessage: this.content,
        lastMessageAt: this.createdAt,
        lastMessageSenderId: this.senderId
    });
});

module.exports = mongoose.model('Message', messageSchema);
