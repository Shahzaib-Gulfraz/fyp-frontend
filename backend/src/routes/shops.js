const express = require('express');
const router = express.Router();
const {
    registerShop,
    loginShop,
    getShops,
    getShop,
    updateShop,
    getMyShop,
    getShopProducts
} = require('../controllers/shopController');
const { shopProtect, isSelfShop } = require('../middleware/auth');
const { uploadShopImages, handleMulterError } = require('../middleware/upload');

// Public routes
router.get('/', getShops);
router.post('/register', uploadShopImages, handleMulterError, registerShop);
router.post('/login', loginShop);
router.get('/:id', getShop);
router.get('/:id/products', getShopProducts);

// Protected routes (Shop only)
router.get('/my/profile', shopProtect, getMyShop);
router.put('/:id', shopProtect, isSelfShop, uploadShopImages, handleMulterError, updateShop);

module.exports = router;
