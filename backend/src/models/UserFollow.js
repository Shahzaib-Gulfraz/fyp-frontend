const mongoose = require('mongoose');

const userFollowSchema = new mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound unique index
userFollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Additional indexes
userFollowSchema.index({ followerId: 1 });
userFollowSchema.index({ followingId: 1 });

// Prevent self-following
userFollowSchema.pre('save', function (next) {
    if (this.followerId.equals(this.followingId)) {
        next(new Error('Users cannot follow themselves'));
    }
    next();
});

module.exports = mongoose.model('UserFollow', userFollowSchema);
