const Shop = require('../models/Shop');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../config/cloudinary');

/**
 * @desc    Create shop
 * @route   POST /api/shops
 * @access  Private (Shop Owner)
 */
const createShop = async (req, res) => {
    try {
        console.log('Creating shop for user:', req.user._id);
        console.log('Shop data received:', req.body);
        console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');

        // Check if user already has a shop
        const existingShop = await Shop.findOne({ ownerId: req.user._id });
        if (existingShop) {
            return res.status(400).json({ message: 'You already have a shop' });
        }

        // Check for duplicate shopUsername
        const duplicateUsername = await Shop.findOne({ shopUsername: req.body.shopUsername });
        if (duplicateUsername) {
            return res.status(400).json({ message: 'Shop username already taken' });
        }

        const shopData = req.body;
        shopData.ownerId = req.user._id;

        // Handle image uploads
        if (req.files) {
            if (req.files.logo && req.files.logo[0]) {
                console.log('Uploading logo...');
                const b64 = Buffer.from(req.files.logo[0].buffer).toString('base64');
                const dataURI = `data:${req.files.logo[0].mimetype};base64,${b64}`;
                shopData.logo = await uploadImage(dataURI, 'shops/logos');
                console.log('Logo uploaded:', shopData.logo);
            }

            if (req.files.banner && req.files.banner[0]) {
                console.log('Uploading banner...');
                const b64 = Buffer.from(req.files.banner[0].buffer).toString('base64');
                const dataURI = `data:${req.files.banner[0].mimetype};base64,${b64}`;
                shopData.banner = await uploadImage(dataURI, 'shops/banners');
                console.log('Banner uploaded:', shopData.banner);
            }
        }

        console.log('Creating shop in database...');
        const shop = await Shop.create(shopData);
        console.log('Shop created:', shop._id);

        // Update user's shopId and role
        console.log('Updating user role...');
        await User.findByIdAndUpdate(req.user._id, {
            shopId: shop._id,
            role: 'shop_owner'
        });

        console.log('Shop creation successful!');
        res.status(201).json({
            message: 'Shop created successfully',
            shop
        });
    } catch (error) {
        console.error('Shop creation error:', error);
        console.error('Error stack:', error.stack);

        // Handle specific errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                message: `${field} already exists`,
                error: error.message
            });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            message: 'Server error',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * @desc    Get all shops
 * @route   GET /api/shops
 * @access  Public
 */
const getShops = async (req, res) => {
    try {
        const { city, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;

        const query = { isActive: true };

        if (city) query.city = city;
        if (search) {
            query.$or = [
                { shopName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const shops = await Shop.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Shop.countDocuments(query);

        res.json({
            shops,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get single shop
 * @route   GET /api/shops/:id
 * @access  Public
 */
const getShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('ownerId', 'username fullName');

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        res.json({ shop });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update shop
 * @route   PUT /api/shops/:id
 * @access  Private (Shop Owner)
 */
const updateShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Check ownership
        if (shop.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update fields
        Object.assign(shop, req.body);
        await shop.save();

        res.json({
            message: 'Shop updated successfully',
            shop
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get my shop
 * @route   GET /api/shops/my/shop
 * @access  Private (Shop Owner)
 */
const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.user._id });

        if (!shop) {
            return res.status(404).json({ message: 'You do not have a shop yet' });
        }

        res.json({ shop });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get shop products
 * @route   GET /api/shops/:id/products
 * @access  Public
 */
const getShopProducts = async (req, res) => {
    try {
        const Product = require('../models/Product');

        const products = await Product.find({
            shopId: req.params.id,
            isActive: true
        }).sort('-createdAt');

        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createShop,
    getShops,
    getShop,
    updateShop,
    getMyShop,
    getShopProducts
};
