const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getShopOrders,
    getOrder,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, restrictTo, isShopOwner } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/shop/:shopId', restrictTo('shop_owner'), getShopOrders);
router.get('/:id', getOrder);
router.put('/:id/status', restrictTo('shop_owner'), updateOrderStatus);

module.exports = router;
