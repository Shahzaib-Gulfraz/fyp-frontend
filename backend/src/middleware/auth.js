const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ message: 'Account is deactivated' });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Restrict to specific roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

/**
 * Protect Shop routes - Verify JWT token and find Shop
 */
const shopProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const Shop = require('../models/Shop');
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.shop = await Shop.findById(decoded.id).select('-password');

            if (!req.shop) {
                return res.status(401).json({ message: 'Shop not found' });
            }

            if (!req.shop.isActive) {
                return res.status(401).json({ message: 'Shop is deactivated' });
            }

            next();
        } catch (error) {
            console.error('Shop Auth middleware error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Check if the authenticated shop is the one being accessed
 */
const isSelfShop = async (req, res, next) => {
    const shopId = req.params.id || req.params.shopId || req.body.shopId;

    if (!shopId) {
        return res.status(400).json({ message: 'Shop ID is required' });
    }

    if (req.shop._id.toString() !== shopId) {
        return res.status(403).json({ message: 'Not authorized to access this shop' });
    }

    next();
};

/**
 * Allow either User or Shop authentication
 */
const multiProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try User first
            const user = await User.findById(decoded.id).select('-password');
            if (user && user.isActive) {
                req.user = user;
                return next();
            }

            // Try Shop if User not found
            const Shop = require('../models/Shop');
            const shop = await Shop.findById(decoded.id).select('-password');
            if (shop && shop.isActive) {
                req.shop = shop;
                return next();
            }

            return res.status(401).json({ message: 'Not authorized, entity not found' });
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect, restrictTo, shopProtect, isSelfShop, multiProtect };
