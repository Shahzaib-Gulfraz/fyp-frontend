const express = require('express');
const router = express.Router();
const {
    getAllShops,
    updateShopStatus,
    getAllProducts,
    updateProductStatus,
    getDashboardStats,
    deleteProduct,
    getAllUsers,
    updateUserStatus
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// All admin routes are protected and restricted to admin role
router.use(protect);
router.use(restrictTo('admin'));

// Shop Management
router.get('/shops', getAllShops);
router.put('/shops/:id/status', updateShopStatus);

// Product Management
router.get('/products', getAllProducts);
router.put('/products/:id/status', updateProductStatus);
router.delete('/products/:id', deleteProduct);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

// Stats
router.get('/stats', getDashboardStats);

module.exports = router;
