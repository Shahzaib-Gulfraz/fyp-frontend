const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    uploadAvatar,
    searchUsers,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect, multiProtect } = require('../middleware/auth');
const { uploadSingle, handleMulterError } = require('../middleware/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', multiProtect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, uploadSingle, handleMulterError, uploadAvatar);
router.get('/users/search', protect, searchUsers);

module.exports = router;
