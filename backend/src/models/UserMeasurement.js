const mongoose = require('mongoose');

const userMeasurementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Measurements (in cm)
    height: {
        type: Number,
        min: 0
    },
    weight: {
        type: Number,
        min: 0
    },
    chest: {
        type: Number,
        min: 0
    },
    waist: {
        type: Number,
        min: 0
    },
    hips: {
        type: Number,
        min: 0
    },
    shoulderWidth: {
        type: Number,
        min: 0
    },
    inseam: {
        type: Number,
        min: 0
    },

    // Additional data
    bodyScanData: {
        type: mongoose.Schema.Types.Mixed, // 3D scan data if available
        default: {}
    },

    isPrimary: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
userMeasurementSchema.index({ userId: 1 });
userMeasurementSchema.index({ isPrimary: 1 });

// Ensure only one primary measurement per user
userMeasurementSchema.pre('save', async function (next) {
    if (this.isPrimary) {
        await mongoose.model('UserMeasurement').updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { isPrimary: false }
        );
    }
    next();
});

module.exports = mongoose.model('UserMeasurement', userMeasurementSchema);
