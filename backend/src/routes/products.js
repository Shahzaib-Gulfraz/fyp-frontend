const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { shopProtect } = require('../middleware/auth');
const { uploadProductImages, handleMulterError } = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes (Shop only)
router.post(
    '/',
    shopProtect,
    uploadProductImages,
    handleMulterError,
    createProduct
);

router.put('/:id', shopProtect, updateProduct);
router.delete('/:id', shopProtect, deleteProduct);

module.exports = router;
