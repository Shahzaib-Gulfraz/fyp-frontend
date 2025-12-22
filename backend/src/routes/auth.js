const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    uploadAvatar
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadSingle, handleMulterError } = require('../middleware/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, uploadSingle, handleMulterError, uploadAvatar);

module.exports = router;
