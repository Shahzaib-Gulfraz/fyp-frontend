const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../middleware/auth');
const { generateTryOn, getHistory } = require('../controllers/tryOnController');

// Validation middleware
const validateTryOn = [
    check('garment_img', 'Garment image URL is required').not().isEmpty(),
    check('human_img', 'Human image URL is required').not().isEmpty()
];

router.post('/generate', protect, validateTryOn, generateTryOn);
router.get('/history', protect, getHistory);

module.exports = router;
