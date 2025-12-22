const express = require('express');
const router = express.Router();
const {
    createShop,
    getShops,
    getShop,
    updateShop,
    getMyShop,
    getShopProducts
} = require('../controllers/shopController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadShopImages, handleMulterError } = require('../middleware/upload');

// Public routes
router.get('/', getShops);
router.get('/:id', getShop);
router.get('/:id/products', getShopProducts);

// Protected routes
router.post(
    '/',
    protect,
    uploadShopImages,
    handleMulterError,
    createShop
);

router.get('/my/shop', protect, restrictTo('shop_owner'), getMyShop);
router.put('/:id', protect, restrictTo('shop_owner'), updateShop);

module.exports = router;
