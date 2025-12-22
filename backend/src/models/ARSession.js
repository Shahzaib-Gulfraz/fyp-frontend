const mongoose = require('mongoose');

const arSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    // Session Data
    sessionType: {
        type: String,
        enum: ['ar_try_on', 'body_scan', 'virtual_fitting_room'],
        required: true
    },
    sessionData: {
        type: mongoose.Schema.Types.Mixed, // Flexible object for AR-specific data
        default: {}
    },

    // Media (Cloudinary)
    screenshot: {
        url: String,
        publicId: String
    },
    video: {
        url: String,
        publicId: String
    },

    // Duration
    durationSeconds: {
        type: Number,
        min: 0
    }
}, {
    timestamps: true
});

// Indexes
arSessionSchema.index({ userId: 1 });
arSessionSchema.index({ productId: 1 });
arSessionSchema.index({ sessionType: 1 });
arSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ARSession', arSessionSchema);
