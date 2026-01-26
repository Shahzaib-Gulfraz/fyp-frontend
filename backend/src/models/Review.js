const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },

    // Review Content
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        trim: true,
        maxlength: [255, 'Title cannot exceed 255 characters']
    },
    comment: {
        type: String,
        trim: true
    },

    // Status
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: true
    },

    // Helpfulness
    helpfulCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Indexes
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isApproved: 1 });

// Compound index to prevent duplicate reviews
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true, sparse: true });

// Update product rating after review is saved
reviewSchema.post('save', async function () {
    const Product = mongoose.model('Product');

    // Calculate average rating
    const stats = await mongoose.model('Review').aggregate([
        { $match: { productId: this.productId, isApproved: true } },
        {
            $group: {
                _id: '$productId',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(this.productId, {
            'stats.rating': Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
            'stats.reviewsCount': stats[0].count
        });
    }
});

// Update product rating after review is deleted
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const Product = mongoose.model('Product');

        const stats = await mongoose.model('Review').aggregate([
            { $match: { productId: doc.productId, isApproved: true } },
            {
                $group: {
                    _id: '$productId',
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(doc.productId, {
                'stats.rating': Math.round(stats[0].avgRating * 10) / 10,
                'stats.reviewsCount': stats[0].count
            });
        } else {
            await Product.findByIdAndUpdate(doc.productId, {
                'stats.rating': 0,
                'stats.reviewsCount': 0
            });
        }
    }
});

module.exports = mongoose.model('Review', reviewSchema);
