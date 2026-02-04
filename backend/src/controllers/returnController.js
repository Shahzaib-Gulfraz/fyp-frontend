const Return = require('../models/Return');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { io, getSocketId } = require('../socket/socketService');
const { createNotification } = require('./notificationController');

// @desc    Create return request
// @route   POST /api/returns
// @access  Private
exports.createReturnRequest = async (req, res) => {
    try {
        const { orderId, items, reason, detailedReason, images } = req.body;

        // Verify order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Verify order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Can only return delivered orders' });
        }

        // Check 14-day return window
        const deliveryDate = order.updatedAt; // Assuming updatedAt is when status changed to delivered
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        if (deliveryDate < fourteenDaysAgo) {
            return res.status(400).json({ message: 'Return window has expired (14 days from delivery)' });
        }

        // Check if return already exists
        const existingReturn = await Return.findOne({ orderId });
        if (existingReturn) {
            return res.status(400).json({ message: 'Return request already exists for this order' });
        }

        // Calculate refund amount
        const refundAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create return request
        const returnRequest = await Return.create({
            orderId,
            userId: req.user._id,
            shopId: order.shopId,
            items,
            reason,
            detailedReason,
            images: images || [],
            refundAmount
        });

        await returnRequest.populate('orderId', 'orderNumber total');

        // Create notification for shop owner
        try {
            const notification = await Notification.create({
                userId: order.shopId, // Shop owner will receive notification
                type: 'return_request',
                title: 'New Return Request',
                message: `Return request received for order ${order.orderNumber}`,
                data: {
                    returnId: returnRequest._id,
                    orderId: order._id,
                    orderNumber: order.orderNumber
                }
            });

            // Send real-time notification via socket
            const shopSocketId = getSocketId(order.shopId.toString());
            if (shopSocketId) {
                io.to(shopSocketId).emit('notification:new', {
                    notification,
                    unreadCount: await Notification.countDocuments({ 
                        userId: order.shopId, 
                        isRead: false 
                    })
                });
            }
        } catch (notifError) {
            console.error('Failed to create return notification:', notifError);
        }

        res.status(201).json({
            success: true,
            return: returnRequest
        });
    } catch (error) {
        console.error('Create return error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's return requests
// @route   GET /api/returns/user
// @access  Private
exports.getUserReturns = async (req, res) => {
    try {
        const returns = await Return.find({ userId: req.user._id })
            .populate('orderId', 'orderNumber total')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            returns
        });
    } catch (error) {
        console.error('Get user returns error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get shop's return requests
// @route   GET /api/returns/shop/:shopId
// @access  Private (Shop owner)
exports.getShopReturns = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { status } = req.query;

        const query = { shopId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const returns = await Return.find(query)
            .populate('userId', 'fullName email phone')
            .populate('orderId', 'orderNumber total shippingAddress')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            returns
        });
    } catch (error) {
        console.error('Get shop returns error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update return status
// @route   PUT /api/returns/:id/status
// @access  Private (Shop owner)
exports.updateReturnStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        const returnRequest = await Return.findById(req.params.id);
        if (!returnRequest) {
            return res.status(404).json({ message: 'Return request not found' });
        }

        returnRequest.status = status;
        if (adminNotes) {
            returnRequest.adminNotes = adminNotes;
        }

        // Update timestamp based on status
        if (status === 'approved') {
            returnRequest.approvedAt = new Date();
        } else if (status === 'rejected') {
            returnRequest.rejectedAt = new Date();
        } else if (status === 'completed') {
            returnRequest.completedAt = new Date();
        }

        await returnRequest.save();

        // Send notification to customer about return status update
        try {
            const statusMessages = {
                approved: 'Your return request has been approved',
                rejected: 'Your return request has been rejected',
                completed: 'Your return has been completed and refund processed'
            };

            if (statusMessages[status]) {
                await createNotification({
                    userId: returnRequest.userId,
                    type: 'return_update',
                    title: 'Return Status Update',
                    message: statusMessages[status],
                    data: {
                        returnId: returnRequest._id,
                        orderId: returnRequest.orderId,
                        status: status
                    }
                });
            }
        } catch (notifError) {
            console.error('Failed to create return status notification:', notifError);
        }

        res.json({
            success: true,
            return: returnRequest
        });
    } catch (error) {
        console.error('Update return status error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get return by ID
// @route   GET /api/returns/:id
// @access  Private
exports.getReturnById = async (req, res) => {
    try {
        const returnRequest = await Return.findById(req.params.id)
            .populate('userId', 'fullName email phone')
            .populate('orderId', 'orderNumber total shippingAddress')
            .populate('shopId', 'name');

        if (!returnRequest) {
            return res.status(404).json({ message: 'Return request not found' });
        }

        // Check authorization
        if (returnRequest.userId._id.toString() !== req.user._id.toString() &&
            (!req.shop || returnRequest.shopId._id.toString() !== req.shop._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({
            success: true,
            return: returnRequest
        });
    } catch (error) {
        console.error('Get return error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
