const Shop = require('../models/Shop');
const jwt = require('jsonwebtoken');
const { uploadImage, deleteImage } = require('../config/cloudinary');

/**
 * Generate JWT token for Shop
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * @desc    Register new shop
 * @route   POST /api/shops/register
 * @access  Public
 */
const registerShop = async (req, res) => {
    try {
        console.log('Registering independent shop:', req.body.email);

        const { email, password, shopName } = req.body;

        // Check if shop exists
        const shopExists = await Shop.findOne({
            $or: [
                { email },
                { shopName }
            ]
        });

        if (shopExists) {
            let message = 'Registration failed';
            if (shopExists.email === email) message = 'Email already registered';
            else if (shopExists.shopName === shopName) message = 'Shop name already taken';

            return res.status(400).json({ message });
        }

        const shopData = { ...req.body };

        // Handle image uploads
        if (req.files) {
            if (req.files.logo && req.files.logo[0]) {
                const b64 = Buffer.from(req.files.logo[0].buffer).toString('base64');
                const dataURI = `data:${req.files.logo[0].mimetype};base64,${b64}`;
                shopData.logo = await uploadImage(dataURI, 'shops/logos');
            }

            if (req.files.banner && req.files.banner[0]) {
                const b64 = Buffer.from(req.files.banner[0].buffer).toString('base64');
                const dataURI = `data:${req.files.banner[0].mimetype};base64,${b64}`;
                shopData.banner = await uploadImage(dataURI, 'shops/banners');
            }
        }

        const shop = await Shop.create(shopData);

        // Generate token
        const token = generateToken(shop._id);

        res.status(201).json({
            message: 'Shop registered successfully',
            token,
            shop: shop.toPublicJSON()
        });
    } catch (error) {
        console.error('Shop registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Login shop
 * @route   POST /api/shops/login
 * @access  Public
 */
const loginShop = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find shop and include password
        const shop = await Shop.findOne({ email }).select('+password');

        if (!shop || !(await shop.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!shop.isActive) {
            return res.status(401).json({ message: 'Shop is deactivated' });
        }

        // Generate token
        const token = generateToken(shop._id);

        res.json({
            message: 'Shop login successful',
            token,
            shop: shop.toPublicJSON()
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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
        const shop = await Shop.findById(req.params.id);

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

        // Check auth (assuming shop is authenticated)
        if (shop._id.toString() !== req.shop._id.toString()) {
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
        const shop = await Shop.findById(req.shop._id);

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        res.json({ shop: shop.toPublicJSON() });
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
    registerShop,
    loginShop,
    getShops,
    getShop,
    updateShop,
    getMyShop,
    getShopProducts
};
