const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    // Product mention support
    productMention: {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        // Cache product details for quick display
        productName: String,
        productImage: String,
        productPrice: Number
    },
    isRead: {
        type: Boolean,
        default: false
    },
    // Indicates if message is from the shop itself (for shop conversations)
    isShopReply: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for scrolling history
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
