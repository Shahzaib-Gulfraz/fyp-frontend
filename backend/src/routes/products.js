const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadProductImages, handleMulterError } = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes (Shop Owner only)
router.post(
    '/',
    protect,
    restrictTo('shop_owner'),
    uploadProductImages,
    handleMulterError,
    createProduct
);

router.put('/:id', protect, restrictTo('shop_owner'), updateProduct);
router.delete('/:id', protect, restrictTo('shop_owner'), deleteProduct);

module.exports = router;
