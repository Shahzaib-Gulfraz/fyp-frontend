const Shop = require('../models/Shop');
const jwt = require('jsonwebtoken');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

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

        if (!shop) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const isMatch = await shop.comparePassword(password);
        if (!isMatch) {
             return res.status(401).json({ message: 'Invalid password' });
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
        console.log('B-DEBUG: Updating shop:', req.params.id);
        console.log('B-DEBUG: req.body:', JSON.stringify(req.body, null, 2));
        console.log('B-DEBUG: req.files:', req.files ? Object.keys(req.files) : 'No files');
        const shop = await Shop.findById(req.params.id);

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Check auth
        if (!req.shop || shop._id.toString() !== req.shop._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Allowed fields for update
        const allowedFields = [
            'shopName', 'description', 'category', 'businessType',
            'phone', 'website', 'address', 'city', 'country', 'zipCode',
            'hours', 'social', 'settings'
        ];

        // Only update allowed fields provided in request
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                let value = req.body[field];
                // Parse JSON if it's a string (happens with FormData)
                if (typeof value === 'string' && (field === 'hours' || field === 'social' || field === 'settings')) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        console.warn(`Failed to parse ${field}:`, e.message);
                    }
                }
                shop[field] = value;
            }
        });

        // Handle image uploads
        if (req.files) {
            console.log('B-DEBUG: Files received:', Object.keys(req.files));
            if (req.files.logo) {
                console.log('B-DEBUG: Logo file details:', {
                    name: req.files.logo[0].originalname,
                    mimetype: req.files.logo[0].mimetype,
                    size: req.files.logo[0].size
                });
            } else {
                console.log('B-DEBUG: No logo file in req.files');
            }

            if (req.files.logo && req.files.logo[0]) {
                const b64 = Buffer.from(req.files.logo[0].buffer).toString('base64');
                const dataURI = `data:${req.files.logo[0].mimetype};base64,${b64}`;
                // Delete old logo if it exists
                if (shop.logo?.publicId) {
                    await deleteImage(shop.logo.publicId);
                }
                shop.logo = await uploadImage(dataURI, 'shops/logos');
            }

            if (req.files.banner && req.files.banner[0]) {
                const b64 = Buffer.from(req.files.banner[0].buffer).toString('base64');
                const dataURI = `data:${req.files.banner[0].mimetype};base64,${b64}`;
                // Delete old banner if it exists
                if (shop.banner?.publicId) {
                    await deleteImage(shop.banner.publicId);
                }
                const bannerRes = await uploadImage(dataURI, 'shops/banners');
                console.log('B-DEBUG: Banner uploaded:', bannerRes);
                shop.banner = bannerRes;
                shop.markModified('banner');
            }
            shop.markModified('logo'); // Ensure logo change is tracked if modified above
        }

        // Special handling for email if needed (usually requires verification)
        if (req.body.email && req.body.email !== shop.email) {
            shop.email = req.body.email;
        }

        await shop.save();
        console.log('B-DEBUG: Shop updated successfully');

        res.json({
            message: 'Shop updated successfully',
            shop: shop.toPublicJSON()
        });
    } catch (error) {
        console.error('B-DEBUG: Update shop error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
        const { search, category, sort = '-createdAt' } = req.query;

        let query = {
            shopId: req.params.id,
            isActive: true
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        const products = await Product.find(query)
            .populate('category', 'name') // Populate category for frontend display
            .sort(sort);

        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Exports moved to bottom

const Follow = require('../models/Follow');
const Review = require('../models/Review');

/**
 * @desc    Follow a shop
 * @route   POST /api/shops/:id/follow
 * @access  Private (User)
 */
const followShop = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const shop = await Shop.findById(id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const exists = await Follow.findOne({ followerId: userId, shopId: id });
        if (exists) {
            return res.status(400).json({ message: 'Already following' });
        }

        await Follow.create({ followerId: userId, shopId: id });
        await Shop.findByIdAndUpdate(id, { $inc: { followersCount: 1 } });

        res.json({ message: 'Followed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Unfollow a shop
 * @route   DELETE /api/shops/:id/follow
 * @access  Private (User)
 */
const unfollowShop = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const deleted = await Follow.findOneAndDelete({ followerId: userId, shopId: id });
        if (deleted) {
            await Shop.findByIdAndUpdate(id, { $inc: { followersCount: -1 } });
        }

        res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Check if following shop
 * @route   GET /api/shops/:id/is-following
 * @access  Private (User)
 */
const checkFollowStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const following = await Follow.exists({ followerId: userId, shopId: id });
        res.json({ isFollowing: !!following });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get shop statistics (Dashboard)
 * @route   GET /api/shops/my/stats
 * @access  Private (Shop Owner)
 */
const getShopStats = async (req, res) => {
    try {
        const shopId = req.shop._id;
        const Order = require('../models/Order');
        const Product = require('../models/Product');

        // 1. Total Revenue & Orders
        const stats = await Order.aggregate([
            { $match: { shopId: shopId, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" },
                    totalOrders: { $sum: 1 },
                    uniqueCustomers: { $addToSet: "$userId" }
                }
            }
        ]);

        const totalRevenue = stats[0]?.totalRevenue || 0;
        const totalOrders = stats[0]?.totalOrders || 0;
        const totalCustomers = stats[0]?.uniqueCustomers?.length || 0;

        // 2. Total Products
        const totalProducts = await Product.countDocuments({ shopId, isActive: true });

        // 3. Recent Orders
        const recentOrders = await Order.find({ shopId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'fullName')
            .lean();

        // 4. Sales Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesTrend = await Order.aggregate([
            {
                $match: {
                    shopId: shopId,
                    createdAt: { $gte: sevenDaysAgo },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days with 0
        const filledTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = salesTrend.find(item => item._id === dateStr);
            filledTrend.push({
                date: dateStr,
                revenue: found ? found.dailyRevenue : 0
            });
        }

        // 5. Pending Orders (Badge)
        const pendingOrders = await Order.countDocuments({
            shopId: shopId,
            status: { $in: ['pending', 'processing'] }
        });

        // 6. Unread Messages (Badge)
        const Conversation = require('../models/Conversation');
        const shopConversations = await Conversation.find({ shopId: shopId });

        let unreadMessages = 0;
        shopConversations.forEach(conv => {
            // Check if there is an unread count for this shop
            // The key in unreadCount Map is usually the participant ID or shopId
            if (conv.unreadCount) {
                // Try getting count by shopId string
                const count = conv.unreadCount.get(shopId.toString());
                if (count) unreadMessages += count;
            }
        });

        // 7. Unread Notifications (Badge)
        const Notification = require('../models/Notification');
        const unreadNotifications = await Notification.countDocuments({
            recipient: shopId,
            isRead: false
        });

        res.json({
            stats: {
                revenue: totalRevenue,
                orders: totalOrders,
                products: totalProducts,
                customers: totalCustomers,
                pendingOrders,
                unreadMessages,
                unreadNotifications
            },
            recentOrders,
            salesTrend: filledTrend
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get shop reviews
 * @route   GET /api/shops/:id/reviews
 * @access  Public
 */
const getShopReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ shopId: id })
            .populate('userId', 'fullName avatar')
            .populate('productId', 'name thumbnail')
            .sort('-createdAt');

        res.json({ reviews });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const forgotPasswordShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ email: req.body.email });
        if (!shop) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

        shop.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        shop.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await shop.save({ validateBeforeSave: false });

        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Shop Password Reset Request</h2>
                <p>Hello ${shop.shopName},</p>
                <p>You requested a password reset for your Shop account.</p>
                <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                    <h1 style="color: #000; letter-spacing: 5px; margin: 10px 0;">${resetToken}</h1>
                    <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: shop.email,
                subject: 'WearVirtually Shop Password Reset',
                message
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (error) {
            shop.resetPasswordToken = undefined;
            shop.resetPasswordExpire = undefined;
            await shop.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resetPasswordShop = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(otp.toString())
            .digest('hex');

        const shop = await Shop.findOne({
            email,
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!shop) {
            return res.status(400).json({ message: 'Invalid code or code has expired' });
        }

        shop.password = password; 
        shop.resetPasswordToken = undefined;
        shop.resetPasswordExpire = undefined;

        await shop.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
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
    getShopProducts,
    followShop,
    unfollowShop,
    checkFollowStatus,
    getShopReviews,
    getShopStats,
    forgotPasswordShop,
    resetPasswordShop
};
