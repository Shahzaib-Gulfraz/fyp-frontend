const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id })
            .populate({
                path: 'items.productId',
                select: 'name price thumbnail stockQuantity isActive'
            });

        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, items: [] });
        }

        res.json({
            status: 'success',
            cart
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, size, color, selectedOptions = {} } = req.body;

        console.log('Add to cart request:', { productId, quantity, size, color });

        // Validate productId
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Validate product exists and is active
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ message: 'Product not found or inactive' });
        }

        // Check stock
        if (product.stockQuantity < quantity) {
            return res.status(400).json({
                message: 'Insufficient stock',
                available: product.stockQuantity
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }

        // Merge size and color into selectedOptions
        const options = { ...selectedOptions };
        if (size) options.size = size;
        if (color) options.color = color;

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update existing item
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].selectedOptions = options;
            cart.items[existingItemIndex].price = product.price;
        } else {
            // Add new item
            cart.items.push({
                productId,
                quantity,
                selectedOptions: options,
                price: product.price
            });
        }

        await cart.save();
        await cart.populate({
            path: 'items.productId',
            select: 'name price thumbnail stockQuantity isActive'
        });

        res.status(201).json({
            status: 'success',
            message: 'Item added to cart',
            cart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Update cart item
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity, selectedOptions } = req.body;

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Validate stock if quantity is being updated
        if (quantity) {
            const product = await Product.findById(item.productId);
            if (product.stockQuantity < quantity) {
                return res.status(400).json({
                    message: 'Insufficient stock',
                    available: product.stockQuantity
                });
            }
            item.quantity = quantity;
        }

        if (selectedOptions) {
            item.selectedOptions = selectedOptions;
        }

        await cart.save();
        await cart.populate({
            path: 'items.productId',
            select: 'name price thumbnail stockQuantity isActive'
        });

        res.json({
            status: 'success',
            message: 'Cart item updated',
            cart
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();
        await cart.populate({
            path: 'items.productId',
            select: 'name price thumbnail stockQuantity isActive'
        });

        res.json({
            status: 'success',
            message: 'Item removed from cart',
            cart
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        await cart.save();

        res.json({
            status: 'success',
            message: 'Cart cleared',
            cart
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
