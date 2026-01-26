const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { productId, orderId, rating, title, comment } = req.body;

        // Verify order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to review this order' });
        }

        // Verify order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Can only review delivered orders' });
        }

        // Verify product is in the order
        const orderItem = order.items.find(item => item.productId.toString() === productId);
        if (!orderItem) {
            return res.status(400).json({ message: 'Product not found in this order' });
        }

        // Find product to get shopId
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ userId: req.user._id, productId, orderId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Create review
        const review = await Review.create({
            userId: req.user._id,
            productId,
            shopId: product.shopId,
            orderId,
            rating,
            title,
            comment,
            isVerifiedPurchase: true
        });

        await review.populate('userId', 'fullName');

        // Update Shop Stats (Rating & Review Count)
        const stats = await Review.aggregate([
            { $match: { shopId: product.shopId } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            await Shop.findByIdAndUpdate(product.shopId, {
                'stats.rating': stats[0].avgRating,
                'stats.reviewsCount': stats[0].numReviews
            });
        } else {
            await Shop.findByIdAndUpdate(product.shopId, {
                'stats.rating': rating,
                'stats.reviewsCount': 1
            });
        }

        res.status(201).json({
            success: true,
            review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ productId, isApproved: true })
            .populate('userId', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ productId, isApproved: true });

        // Calculate rating distribution
        const mongoose = require('mongoose');
        const ratingStats = await Review.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingStats.forEach(stat => {
            distribution[stat._id] = stat.count;
        });

        res.json({
            success: true,
            reviews,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            },
            ratingDistribution: distribution
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user._id })
            .populate('productId', 'name thumbnail')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        const { rating, title, comment } = req.body;

        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        review.rating = rating || review.rating;
        review.title = title !== undefined ? title : review.title;
        review.comment = comment !== undefined ? comment : review.comment;

        await review.save();

        res.json({
            success: true,
            review
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.helpfulCount += 1;
        await review.save();

        res.json({
            success: true,
            helpfulCount: review.helpfulCount
        });
    } catch (error) {
        console.error('Mark helpful error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
