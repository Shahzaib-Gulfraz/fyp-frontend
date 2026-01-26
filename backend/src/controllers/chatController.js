const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const socketService = require('../socket/socketService');

/**
 * Chat Controller
 * Manages conversations and messages
 */

// ==================== GET CONVERSATIONS ====================
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const conversations = await Conversation.find({
            participants: currentUserId
        })
            .sort({ updatedAt: -1 })
            .populate('participants', 'username fullName profileImage')
            .populate('lastMessage.sender', 'username');

        res.status(200).json({
            success: true,
            data: { conversations }
        });
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
};

// ==================== GET MESSAGES ====================
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // multiProtect sets either req.user or req.shop
        const currentUserId = req.user?._id;
        const currentShopId = req.shop?._id;

        // Verify participation - either as user participant OR as shop owner
        let conversation;

        if (currentUserId) {
            // User accessing their conversation
            conversation = await Conversation.findOne({
                _id: conversationId,
                participants: currentUserId
            });
        } else if (currentShopId) {
            // Shop owner accessing their shop conversation
            conversation = await Conversation.findOne({
                _id: conversationId,
                shopId: currentShopId,
                conversationType: 'user-to-shop'
            });
        }

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found or unauthorized' });
        }

        // Reset unread count for current user/shop
        if (conversation.unreadCount) {
            const entityId = (currentUserId || currentShopId).toString();
            if (conversation.unreadCount.get(entityId) > 0) {
                conversation.unreadCount.set(entityId, 0);
                await conversation.save();
            }
        }

        const skip = (page - 1) * limit;
        const entityType = currentUserId ? 'User' : 'Shop';
        const entityId = currentUserId || currentShopId;
        console.log(`B-DEBUG: Fetching messages for Convo: ${conversationId}, ${entityType}: ${entityId}`);
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit) + 1);

        console.log(`B-DEBUG: Found ${messages.length} messages.`);

        const hasMore = messages.length > limit;
        if (hasMore) {
            messages.pop(); // Remove the extra message
        }

        // Populate conversation participants to send back
        // We already found it above, but need to populate it if not already
        const conversationDetails = await Conversation.findById(conversationId)
            .populate('participants', 'username fullName profileImage')
            .populate('shopId', 'shopName shopUsername profileImage');

        res.status(200).json({
            success: true,
            data: {
                messages,
                conversation: conversationDetails,
                hasMore
            }
        });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

// ==================== START CHAT (Find or Create) ====================
exports.startChat = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const currentUserId = req.user._id;

        if (!recipientId) {
            return res.status(400).json({ success: false, message: 'Recipient ID is required' });
        }

        // 1. Check if conversation exists
        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, recipientId] }
        })
            .populate('participants', 'username fullName profileImage')
            .populate('lastMessage.sender', 'username');

        // 2. If not, create new one
        if (!conversation) {
            conversation = new Conversation({
                participants: [currentUserId, recipientId]
            });
            await conversation.save();

            // Populate for consistency
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'username fullName profileImage');
        }

        res.status(200).json({
            success: true,
            data: { conversation }
        });

    } catch (error) {
        console.error('Start Chat Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start chat',
            error: error.message
        });
    }
};

// ==================== SEND MESSAGE ====================
exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, text } = req.body;
        const senderId = req.user._id;

        if (!recipientId || !text) {
            return res.status(400).json({ success: false, message: 'Recipient and text are required' });
        }

        // 1. Find or Create Conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId]
            });
            await conversation.save();
        }

        // 2. Create Message
        const message = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text
        });
        await message.save();

        // 3. Update Conversation Last Message & Unread Count
        const currentUnread = conversation.unreadCount ? (conversation.unreadCount.get(recipientId.toString()) || 0) : 0;

        conversation.lastMessage = {
            text,
            sender: senderId,
            createdAt: message.createdAt,
            isRead: false
        };

        // Ensure unreadCount map exists
        if (!conversation.unreadCount) {
            conversation.unreadCount = new Map();
        }
        conversation.unreadCount.set(recipientId.toString(), currentUnread + 1);

        await conversation.save();

        // 4. Real-time Notification via Socket
        // Emit 'new_message' to the recipient's room (userId)
        const messageData = {
            _id: message._id,
            conversationId: conversation._id,
            text: message.text,
            sender: senderId,
            createdAt: message.createdAt
        };

        socketService.emitToUser(recipientId, 'new_message', messageData);

        res.status(201).json({
            success: true,
            data: { message, conversationId: conversation._id }
        });

    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

// ==================== SHOP CONVERSATIONS ====================

/**
 * Get or Create Shop Conversation
 * Creates a conversation between user and shop
 */
exports.getOrCreateShopConversation = async (req, res) => {
    try {
        const { shopId } = req.params;
        const userId = req.user._id;

        if (!shopId) {
            return res.status(400).json({ success: false, message: 'Shop ID is required' });
        }

        // Check if shop exists
        // Check if shop exists
        const Shop = require('../models/Shop');
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ success: false, message: 'Shop not found' });
        }

        console.log(`B-DEBUG: Finding shop conversation for Shop ${shopId}, User ${userId}`);

        // Find existing conversation
        let conversation = await Conversation.findOne({
            conversationType: 'user-to-shop',
            shopId: shopId,
            participants: userId
        })
            .populate('participants', 'username fullName profileImage')
            .populate('shopId', 'shopName shopUsername profileImage');

        if (conversation) {
            console.log(`B-DEBUG: Found existing shop convo: ${conversation._id}`);
        } else {
            console.log(`B-DEBUG: No existing shop convo found. Creating new.`);
        }

        // Create new conversation if doesn't exist
        if (!conversation) {
            conversation = new Conversation({
                conversationType: 'user-to-shop',
                shopId: shopId,
                participants: [userId]
            });
            await conversation.save();

            // Populate for response
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'username fullName profileImage')
                .populate('shopId', 'shopName shopUsername profileImage');
        }

        // Reset unread count for user when they open/fetch the conversation
        if (conversation.unreadCount && conversation.unreadCount.get(userId.toString()) > 0) {
            conversation.unreadCount.set(userId.toString(), 0);
            await conversation.save();
        }

        res.status(200).json({
            success: true,
            data: { conversation }
        });

    } catch (error) {
        console.error('Get/Create Shop Conversation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get shop conversation',
            error: error.message
        });
    }
};

/**
 * Send Message to Shop
 * Supports optional product mention
 */
exports.sendShopMessage = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { text, productId } = req.body;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Message text is required' });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
            conversationType: 'user-to-shop',
            shopId: shopId,
            participants: userId
        });

        if (!conversation) {
            conversation = new Conversation({
                conversationType: 'user-to-shop',
                shopId: shopId,
                participants: [userId]
            });
            await conversation.save();
        }

        // Prepare message data
        const messageData = {
            conversationId: conversation._id,
            sender: userId,
            text
        };

        // If product is mentioned, fetch and cache product details
        if (productId) {
            const Product = require('../models/Product');
            const product = await Product.findById(productId);

            if (product) {
                // Fix: Schema expects ObjectId, not an object. 
                // If we want snapshot, we need to change Schema. 
                // For now, store ID. populate() will handle retrieval.
                messageData.productMention = product._id;
            }
        }

        // Create message
        const message = new Message(messageData);
        await message.save();

        // Update Conversation Last Message & Unread Count for Shop
        const currentShopUnread = conversation.unreadCount ? (conversation.unreadCount.get(shopId.toString()) || 0) : 0;

        conversation.lastMessage = {
            text,
            sender: userId,
            createdAt: message.createdAt,
            isRead: false
        };

        if (!conversation.unreadCount) {
            conversation.unreadCount = new Map();
        }
        conversation.unreadCount.set(shopId.toString(), currentShopUnread + 1);

        await conversation.save();

        // Emit real-time notification to shop owner
        const Shop = require('../models/Shop');
        const shop = await Shop.findById(shopId);
        if (shop) {
            const messagePayload = {
                _id: message._id,
                conversationId: conversation._id,
                text: message.text,
                sender: userId,
                productMention: message.productMention,
                createdAt: message.createdAt,
                unreadCount: currentShopUnread + 1 // Send updated count
            };

            // Assume shop owner is listening on shopId room (if shop logic implemented) 
            // OR if shop has an owner user, emit to them.
            // For now, emit to shopId room which shop interface would join.
            socketService.emitToUser(shop._id, 'new_message', messagePayload);
        }

        res.status(201).json({
            success: true,
            data: { message, conversationId: conversation._id }
        });

    } catch (error) {
        console.error('Send Shop Message Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send shop message',
            error: error.message
        });
    }
};

/**
 * Mark Conversation as Read
 */
exports.markConversationRead = async (req, res) => {
    try {
        const { conversationId } = req.body;
        const userId = req.user._id;

        if (!conversationId) {
            return res.status(400).json({ success: false, message: 'Conversation ID is required' });
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        });

        if (conversation && conversation.unreadCount) {
            conversation.unreadCount.set(userId.toString(), 0);
            await conversation.save();
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
};

/**
 * Get Shop Products (for product picker)
 */
exports.getShopProducts = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { search = '', limit = 20 } = req.query;

        const Product = require('../models/Product');

        const query = { shopId };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query)
            .select('name price images thumbnail')
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: { products }
        });

    } catch (error) {
        console.error('Get Shop Products Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shop products',
            error: error.message
        });
    }
};

/**
 * Get All Conversations for a Shop (Seller Dashboard)
 */
exports.getAllShopConversations = async (req, res) => {
    try {
        const { shopId } = req.params;
        console.log(`B-DEBUG: Getting conversations for ShopID: ${shopId}`);

        // Note: shopId param might be redundant if we use req.shop._id from shopProtect middleware
        // But let's support param for flexibility, verified against req.shop

        // If shopProtect middleware is used, req.shop is available
        // If regular protect is used, we only have req.user

        // For Dashboard, we assume shopProtect or explicit check

        const conversations = await Conversation.find({
            shopId: shopId,
            conversationType: 'user-to-shop'
        })
            .sort({ updatedAt: -1 })
            .populate('participants', 'username fullName profileImage'); // The User

        console.log(`B-DEBUG: Found ${conversations.length} conversations for shop ${shopId}`);
        if (conversations.length > 0) {
            console.log('B-DEBUG: First convo:', conversations[0]._id);
        } else {
            // Debug check: find ANY shop conversation to see if data exists
            const sample = await Conversation.findOne({ conversationType: 'user-to-shop' });
            if (sample) console.log('B-DEBUG: Sample existing shop convo:', sample);
        }

        res.status(200).json({
            success: true,
            data: { conversations }
        });

    } catch (error) {
        console.error('Get All Shop Conversations Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shop conversations',
            error: error.message
        });
    }
};

/**
 * Reply to Shop Conversation (For Seller)
 */
exports.replyToShopConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { text } = req.body;
        // const userId = req.user._id; 

        if (!conversationId || !text) {
            return res.status(400).json({ success: false, message: 'Conversation ID and text are required' });
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            conversationType: 'user-to-shop'
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Create Message (sender = ShopID, flag = true)
        const message = new Message({
            conversationId: conversation._id,
            sender: conversation.shopId,
            text,
            isShopReply: true
        });

        await message.save();

        // Update Conversation
        const recipientId = conversation.participants[0];
        const currentUnread = conversation.unreadCount ? (conversation.unreadCount.get(recipientId.toString()) || 0) : 0;

        conversation.lastMessage = {
            text,
            sender: conversation.shopId,
            createdAt: message.createdAt,
            isRead: false
        };

        if (!conversation.unreadCount) conversation.unreadCount = new Map();
        conversation.unreadCount.set(recipientId.toString(), currentUnread + 1);

        await conversation.save();

        // Emit Socket Event to User
        const messageData = {
            _id: message._id,
            conversationId: conversation._id,
            text: message.text,
            sender: conversation.shopId,
            createdAt: message.createdAt,
            isShopReply: true
        };

        // Use require here to avoid circular dep issues if any
        // socketService is already required at top level though.
        socketService.emitToUser(recipientId, 'new_message', messageData);

        res.status(201).json({
            success: true,
            data: { message }
        });

    } catch (error) {
        console.error('Reply To Shop Conversation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to reply', error: error.message });
    }
};
