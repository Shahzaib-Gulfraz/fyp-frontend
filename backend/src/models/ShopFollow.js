const mongoose = require('mongoose');

const shopFollowSchema = new mongoose.Schema({
    userId: {
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

// Compound unique index
shopFollowSchema.index({ userId: 1, shopId: 1 }, { unique: true });

// Additional indexes
shopFollowSchema.index({ userId: 1 });
shopFollowSchema.index({ shopId: 1 });

module.exports = mongoose.model('ShopFollow', shopFollowSchema);
