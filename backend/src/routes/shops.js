const express = require('express');
const router = express.Router();
const {
    registerShop,
    loginShop,
    getShops,
    getShop,
    updateShop,
    getMyShop,
    getShopProducts,
    followShop,
    unfollowShop,
    checkFollowStatus,
    getShopReviews,
    getShopStats,
    forgotPasswordShop,
    resetPasswordShop
} = require('../controllers/shopController');
const { shopProtect, isSelfShop, protect } = require('../middleware/auth');
const { uploadShopImages, handleMulterError } = require('../middleware/upload');

// Public routes
router.get('/', getShops);
router.post('/register', uploadShopImages, handleMulterError, registerShop);
router.post('/login', loginShop);
router.post('/forgot-password', forgotPasswordShop);
router.post('/reset-password', resetPasswordShop);

// Protected routes (Shop only) - MUST come before /:id routes
router.get('/my/profile', shopProtect, getMyShop);
router.get('/my/stats', shopProtect, getShopStats);

// Parameterized routes (after specific routes)
router.get('/:id', getShop);
router.get('/:id/products', getShopProducts);
router.get('/:id/reviews', getShopReviews);

// Protected routes (User Actions)
router.post('/:id/follow', protect, followShop);
router.delete('/:id/follow', protect, unfollowShop);
router.get('/:id/is-following', protect, checkFollowStatus);

// Protected parameterized routes
router.put('/:id', shopProtect, isSelfShop, uploadShopImages, handleMulterError, updateShop);

module.exports = router;
