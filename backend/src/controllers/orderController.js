const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
    try {
        const { shopId, items, shippingAddress, paymentMethod, customerNotes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }

            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                productId: item.productId,
                variantId: item.variantId,
                productName: product.name,
                variantDetails: item.variantDetails,
                unitPrice: product.price,
                quantity: item.quantity,
                subtotal: itemSubtotal,
                productImage: product.thumbnail
            });
        }

        // Create order
        const order = await Order.create({
            userId: req.user._id,
            shopId,
            subtotal,
            total: subtotal, // Add tax/shipping if needed
            shippingAddress,
            paymentMethod,
            customerNotes
        });

        // Create order items
        const createdItems = await OrderItem.insertMany(
            orderItems.map(item => ({ ...item, orderId: order._id }))
        );

        // Update shop stats
        await Shop.findByIdAndUpdate(shopId, {
            $inc: {
                'stats.totalOrders': 1,
                'stats.totalSales': subtotal
            }
        });

        res.status(201).json({
            message: 'Order created successfully',
            order,
            items: createdItems
        });
    } catch (error) {
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
 * @access  Private (Shop Owner)
 */
const getShopOrders = async (req, res) => {
    try {
        const orders = await Order.find({ shopId: req.params.shopId })
            .populate('userId', 'fullName email phone')
            .sort('-createdAt');

        res.json({ orders });
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
        if (
            order.userId._id.toString() !== req.user._id.toString() &&
            order.shopId.ownerId?.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get order items
        const items = await OrderItem.find({ orderId: order._id })
            .populate('productId', 'name thumbnail');

        res.json({ order, items });
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
