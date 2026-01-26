const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

/**
 * Friend Routes
 * All routes require authentication
 */

// ==================== FRIEND REQUESTS ====================

// Send friend request
router.post('/request/:userId', protect, friendController.sendFriendRequest);

// Accept friend request
router.post('/accept/:requestId', protect, friendController.acceptFriendRequest);

// Reject friend request
router.post('/reject/:requestId', protect, friendController.rejectFriendRequest);

// Get pending friend requests (received)
router.get('/requests/pending', protect, friendController.getPendingRequests);

// Get sent friend requests
router.get('/requests/sent', protect, friendController.getSentRequests);

// ==================== FRIEND MANAGEMENT ====================

// Get friends list
router.get('/', protect, friendController.getFriends);

// Remove friend
router.delete('/remove/:userId', protect, friendController.removeFriend);

// Get friend suggestions
router.get('/suggestions', protect, friendController.getFriendSuggestions);

module.exports = router;
