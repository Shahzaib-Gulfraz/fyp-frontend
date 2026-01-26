const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
} = require('../controllers/productController');
const { shopProtect, protect } = require('../middleware/auth');
const { uploadProductImages, handleMulterError, uploadSingle } = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Upload route (User accessible for Try-On)
router.post(
    '/upload-image',
    protect,
    uploadSingle,
    handleMulterError,
    uploadProductImage
);

// Protected routes (Shop only)
router.post(
    '/',
    shopProtect,
    uploadProductImages,
    handleMulterError,
    createProduct
);

router.put(
    '/:id',
    shopProtect,
    uploadProductImages,
    handleMulterError,
    updateProduct
);
router.delete('/:id', shopProtect, deleteProduct);

module.exports = router;
