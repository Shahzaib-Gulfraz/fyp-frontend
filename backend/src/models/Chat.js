const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    // Participants
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    // Last message info (for quick display in chat list)
    lastMessage: {
        type: String
    },
    lastMessageAt: {
        type: Date
    },
    lastMessageSenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Ensure exactly 2 participants
chatSchema.pre('save', function (next) {
    if (this.participants.length !== 2) {
        next(new Error('Chat must have exactly 2 participants'));
    }

    // Ensure participants are unique
    const uniqueParticipants = [...new Set(this.participants.map(p => p.toString()))];
    if (uniqueParticipants.length !== 2) {
        next(new Error('Chat participants must be unique'));
    }

    next();
});

module.exports = mongoose.model('Chat', chatSchema);
