const express = require('express');
const router = express.Router();
const {
    getSavedItems,
    addSavedItem,
    removeSavedItem,
    checkSaved
} = require('../controllers/savedItemController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getSavedItems);
router.post('/', addSavedItem);
router.delete('/:id', removeSavedItem);
router.get('/check/:productId', checkSaved);

module.exports = router;
