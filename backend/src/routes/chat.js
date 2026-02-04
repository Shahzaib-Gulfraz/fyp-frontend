const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, shopProtect, multiProtect } = require('../middleware/auth');

// Shop Owner Routes (Seller Dashboard) - Must be before generic user routes if paths overlap (they don't really)
router.get('/shop/:shopId/conversations', shopProtect, chatController.getAllShopConversations);
router.post('/shop/:conversationId/reply', shopProtect, chatController.replyToShopConversation);

// Routes that need both User and Shop access
router.get('/messages/:conversationId', multiProtect, chatController.getMessages);
router.post('/mark-read', multiProtect, chatController.markConversationRead);

// User-to-User & User-to-Shop Routes (From User perspective)
// All these require USER authentication
router.use(protect);

router.get('/conversations', chatController.getConversations);
router.post('/message', chatController.sendMessage);
router.post('/start', chatController.startChat);

// Shop Chat Routes (For Users talking to Shops)
router.get('/shop/:shopId', chatController.getOrCreateShopConversation);
router.post('/shop/:shopId/message', chatController.sendShopMessage);
router.get('/shop/:shopId/products', chatController.getShopProducts);

module.exports = router;
