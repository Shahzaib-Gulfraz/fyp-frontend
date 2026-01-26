const mongoose = require('mongoose');

const tryOnSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    garmentImage: {
        type: String,
        required: true
    },
    userImage: {
        type: String,
        required: true
    },
    resultImage: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    garmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    predictionId: {
        type: String
    },
    error: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TryOn', tryOnSchema);
