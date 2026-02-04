const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { createNotification } = require('./notificationController');
const socketService = require('../socket/socketService');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, customerNotes } = req.body;
        const Cart = require('../models/Cart');

        // Get user's cart
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Get shopId from first product (assuming all items from same shop)
        const shopId = cart.items[0].productId.shopId;

        // Prepare order items
        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            quantity: item.quantity,
            price: item.price,
            selectedOptions: item.selectedOptions ? Object.fromEntries(item.selectedOptions) : {},
            thumbnail: item.productId.thumbnail?.url || item.productId.thumbnail
        }));

        // Calculate totals
        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = req.body.shippingFee || 0;
        const total = subtotal + shippingFee;

        // Generate order number
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        const orderNumber = `WV-${timestamp}-${random}`;

        // Create order
        const order = await Order.create({
            orderNumber,
            userId: req.user._id,
            shopId,
            items: orderItems,
            subtotal,
            shippingFee,
            total,
            shippingAddress,
            paymentMethod: paymentMethod || 'cod',
            customerNotes
        });

        // Send real-time notification to shop about new order
        try {
            await createNotification({
                recipient: shopId,
                sender: req.user._id,
                type: 'new_order',
                refId: order._id,
                refModel: 'Order',
                text: `New order #${orderNumber} received! Total: $${total.toFixed(2)}`
            });
            
            // Also emit a specific new_order event for dashboard stats update
            socketService.emitToUser(shopId, 'new_order', {
                order: {
                    _id: order._id,
                    orderNumber,
                    total,
                    status: 'pending'
                }
            });
        } catch (notifError) {
            console.warn('Failed to send order notification:', notifError.message);
        }

        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate('shopId', 'shopName logo')
            .sort('-createdAt');

        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get shop's orders
 * @route   GET /api/orders/shop/:shopId
 * @access  Private (Shop)
 */
const getShopOrders = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { status, page = 1, limit = 20 } = req.query;

        // Build query
        const query = { shopId };
        if (status && status !== 'all') {
            query.status = status;
        }

        // Get total count for pagination
        const total = await Order.countDocuments(query);

        // Get orders with pagination
        const orders = await Order.find(query)
            .populate('userId', 'fullName email phone')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        res.json({
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'fullName email phone')
            .populate('shopId', 'shopName email phone');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        const isCustomer = req.user && order.userId._id.toString() === req.user._id.toString();
        const isShop = req.shop && order.shopId._id.toString() === req.shop._id.toString();

        if (!isCustomer && !isShop) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Shop Owner)
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const previousStatus = order.status;
        order.status = status;

        // Update timestamps based on status
        if (status === 'shipped' && !order.shippedAt) {
            order.shippedAt = new Date();
        }
        if (status === 'delivered' && !order.deliveredAt) {
            order.deliveredAt = new Date();
        }
        if (status === 'cancelled' && !order.cancelledAt) {
            order.cancelledAt = new Date();
        }

        await order.save();

        // Send notification to customer about status change
        if (previousStatus !== status) {
            const statusMessages = {
                'processing': `Your order #${order.orderNumber} is now being processed`,
                'shipped': `Your order #${order.orderNumber} has been shipped!`,
                'delivered': `Your order #${order.orderNumber} has been delivered!`,
                'cancelled': `Your order #${order.orderNumber} has been cancelled`
            };

            try {
                await createNotification({
                    recipient: order.userId,
                    sender: order.shopId,
                    type: 'order_status',
                    refId: order._id,
                    refModel: 'Order',
                    text: statusMessages[status] || `Order #${order.orderNumber} status updated to ${status}`
                });
            } catch (notifError) {
                console.warn('Failed to send status notification:', notifError.message);
            }
        }

        res.json({
            message: 'Order status updated',
            order
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getShopOrders,
    getOrder,
    updateOrderStatus
};
