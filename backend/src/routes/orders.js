const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getShopOrders,
    getOrder,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, shopProtect, multiProtect } = require('../middleware/auth');

// Customer routes
router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);

// Shop routes
router.get('/shop', shopProtect, getShopOrders);
router.put('/:id/status', shopProtect, updateOrderStatus);

// Shared routes
router.get('/:id', multiProtect, getOrder);

module.exports = router;
