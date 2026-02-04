const Notification = require('../models/Notification');
const socketService = require('../socket/socketService');

/**
 * Create a notification (Internal helper, not an API endpoint usually)
 * @param {Object} data - { recipient, sender, type, refId, refModel, text }
 */
exports.createNotification = async (data) => {
    try {
        // Determine recipient model (User or Shop)
        const Shop = require('../models/Shop');
        const User = require('../models/User');
        
        let recipientModel = 'User';
        let senderModel = 'User';
        
        // Check if recipient is a shop
        if (data.recipient) {
            const isShop = await Shop.findById(data.recipient);
            if (isShop) {
                recipientModel = 'Shop';
            }
        }
        
        // Check if sender is a shop
        if (data.sender) {
            const isShopSender = await Shop.findById(data.sender);
            if (isShopSender) {
                senderModel = 'Shop';
            }
        }

        const notification = new Notification({
            ...data,
            recipientModel,
            senderModel
        });
        await notification.save();

        // Emit real-time event if socket is available
        try {
            const io = socketService.getIO();
            if (io) {
                // Assuming we join rooms by userId/shopId
                io.to(data.recipient.toString()).emit('notification:new', notification);
            }
        } catch (socketError) {
            console.warn('Socket emission failed:', socketError.message);
        }

        return notification;
    } catch (error) {
        console.error('Create Notification Error:', error);
        // Don't throw, just log. Notifications shouldn't break the main flow.
        return null;
    }
};

/**
 * Get user notifications
 * @route GET /api/notifications
 */
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : (req.shop ? req.shop._id : null);
        const { page = 1, limit = 20 } = req.query;

        if (!userId) {
             return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('sender', 'username fullName profileImage');

        const total = await Notification.countDocuments({ recipient: userId });
        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        res.status(200).json({
            success: true,
            data: {
                notifications,
                total,
                unreadCount,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

/**
 * Mark notification as read
 * @route PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user._id : req.shop._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
};

/**
 * Mark all as read
 * @route PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.shop._id;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
};

/**
 * Delete notification
 * @route DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user._id : req.shop._id;

        await Notification.findOneAndDelete({ _id: id, recipient: userId });

        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
};
