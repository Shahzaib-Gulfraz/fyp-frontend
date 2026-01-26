const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    }
}, {
    timestamps: true
});

// Ensure a user can only follow a shop once
followSchema.index({ followerId: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
