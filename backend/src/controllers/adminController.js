const Shop = require('../models/Shop');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * @desc    Get all shops (for admin)
 * @route   GET /api/admin/shops
 * @access  Private (Admin)
 */
const getAllShops = async (req, res) => {
    try {
        const { status, city, search } = req.query;
        const query = {};

        if (status === 'verified') query.isVerified = true;
        if (status === 'pending') query.isVerified = false;
        if (status === 'inactive') query.isActive = false;
        if (city) query.city = city;
        if (search) {
            query.$or = [
                { shopName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const shops = await Shop.find(query).sort('-createdAt');
        res.json({ shops });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update shop status (Approve/Reject/Block)
 * @route   PUT /api/admin/shops/:id/status
 * @access  Private (Admin)
 */
const updateShopStatus = async (req, res) => {
    try {
        const { isVerified, isActive } = req.body;
        console.log(`B-DEBUG: [AdminController] Updating shop ${req.params.id}`, { isVerified, isActive });
        console.log('B-DEBUG: [AdminController] req.body:', JSON.stringify(req.body));

        const shop = await Shop.findById(req.params.id);

        if (!shop) {
            console.warn(`B-DEBUG: [AdminController] Shop NOT FOUND: ${req.params.id}`);
            return res.status(404).json({ message: 'Shop not found' });
        }

        console.log(`B-DEBUG: [AdminController] Shop found: ${shop.shopName}, Current status: Verified=${shop.isVerified}, Active=${shop.isActive}`);

        if (isVerified !== undefined) shop.isVerified = isVerified;
        if (isActive !== undefined) shop.isActive = isActive;

        await shop.save();
        console.log(`B-DEBUG: Shop ${req.params.id} updated successfully`);
        res.json({
            message: 'Shop status updated successfully',
            shop: shop.toPublicJSON()
        });
    } catch (error) {
        console.error('B-DEBUG: Update shop error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            console.error('B-DEBUG: Validation errors:', messages);
            return res.status(400).json({ message: 'Validation Error', errors: messages });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get all products (across all shops)
 * @route   GET /api/admin/products
 * @access  Private (Admin)
 */
const getAllProducts = async (req, res) => {
    try {
        const { search, category, isActive } = req.query;
        const query = {};

        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query)
            .populate('shopId', 'shopName email')
            .sort('-createdAt');

        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update product status (Block/Unblock)
 * @route   PUT /api/admin/products/:id/status
 * @access  Private (Admin)
 */
const updateProductStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        // Use findByIdAndUpdate to bypass full document validation (which might fail on legacy data)
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true } // Return the updated document
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            message: `Product ${isActive ? 'unblocked' : 'blocked'} successfully`,
            product
        });
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get dashboard summary stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalShops = await Shop.countDocuments();
        const pendingShops = await Shop.countDocuments({ isVerified: false });
        const totalProducts = await Product.countDocuments();

        // You could add more complex stats like revenue if needed

        res.json({
            stats: {
                totalUsers,
                totalShops,
                pendingShops,
                totalProducts
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/admin/products/:id
 * @access  Private (Admin)
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();

        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res) => {
    try {
        const { search, isActive } = req.query;
        const query = { role: 'user' }; // Only fetch regular users

        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort('-createdAt');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update user status (Block/Unblock)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin)
 */
const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        res.json({
            message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllShops,
    updateShopStatus,
    getAllProducts,
    updateProductStatus,
    getDashboardStats,
    deleteProduct,
    getAllUsers,
    updateUserStatus
};
