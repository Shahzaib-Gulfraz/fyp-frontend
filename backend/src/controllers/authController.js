const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        console.log("/register")
        const { username, email, password, fullName, phone, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({
                message: userExists.email === email ? 'Email already registered' : 'Username already taken'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            fullName,
            phone,
            role: role || 'user'
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        console.log("🔵 Login attempt for email:", req.body.email);
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            console.log("❌ Missing email or password");
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user and include password
        console.log("🔵 Finding user in DB...");
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log("❌ User not found:", email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is active
        if (!user.isActive) {
            console.log("❌ Account inactive for:", email);
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        // Check password
        console.log("🔵 Comparing passwords...");
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            console.log("❌ Password mismatch for:", email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        console.log("🔵 Updating last login...");
        user.lastLoginAt = new Date();
        await user.save();

        // Generate token
        console.log("🔵 Generating token...");
        if (!process.env.JWT_SECRET) {
            console.error("⚠️ JWT_SECRET is not defined in environment variables!");
            throw new Error("JWT_SECRET is missing from server configuration");
        }
        const token = generateToken(user._id);

        console.log("✅ Login successful for:", email);
        res.json({
            message: 'Login successful',
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error("🔥 Login Error:", error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    try {
        console.log("/getMe")
        if (req.user) {
            // Use req.user directly - it's already populated with friends from middleware
            return res.json({
                user: {
                    id: req.user._id,
                    username: req.user.username,
                    email: req.user.email,
                    fullName: req.user.fullName,
                    phone: req.user.phone,
                    bio: req.user.bio,
                    location: req.user.location,
                    profileImage: req.user.profileImage,
                    role: req.user.role,
                    friends: req.user.friends, // This is populated from middleware
                    isVerified: req.user.isVerified,
                    createdAt: req.user.createdAt
                }
            });
        } else if (req.shop) {
            // If it's a shop owner, return shop data under 'user' key for frontend compatibility
            // or just return the shop data.
            const shop = await (require('../models/Shop')).findById(req.shop._id);
            return res.json({
                user: {
                    ...shop.toObject(),
                    id: shop._id,
                    role: 'shop_owner',
                    fullName: shop.shopName,
                    username: shop.shopUsername || shop.shopName,
                }
            });
        }
        res.status(401).json({ message: 'Not authorized' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        console.log("/updateProfile");
        console.log("Request body:", req.body);
        console.log("User ID:", req.user._id);
        
        const { fullName, phone, username, bio, location } = req.body;

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (fullName) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (username) {
            // Check if username is taken by another user
            const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            user.username = username;
        }
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;

        await user.save();
        
        const updatedUser = user.toPublicJSON();
        console.log("Updated user:", updatedUser);

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
    try {
        console.log("/changePassword")
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Upload avatar
 * @route   POST /api/auth/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
    try {
        console.log("/uploadAvatar");
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const { uploadImage, deleteImage } = require('../config/cloudinary');

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const user = await User.findById(req.user._id);

        // Delete old profile image if exists
        if (user.profileImage && user.profileImage.publicId) {
            try {
                console.log(`Deleting old profile image: ${user.profileImage.publicId}`);
                await deleteImage(user.profileImage.publicId);
            } catch (deleteError) {
                console.error("Error deleting old profile image:", deleteError);
                // Continue with upload even if delete fails
            }
        }

        // Upload to Cloudinary
        const result = await uploadImage(dataURI, 'avatars');

        // Update user profile image
        user.profileImage = {
            url: result.secure_url || result.url,
            publicId: result.public_id
        };
        await user.save();

        res.json({
            message: 'Profile image uploaded successfully',
            profileImage: user.profileImage.url,
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Search users (for finding friends)
 * @route   GET /api/auth/users/search
 * @access  Private
 */
const searchUsers = async (req, res) => {
    try {
        const { q, limit = 20 } = req.query;
        const currentUserId = req.user._id;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const searchRegex = new RegExp(q, 'i');

        const users = await User.find({
            _id: { $ne: currentUserId },
            isActive: true,
            $or: [
                { username: searchRegex },
                { fullName: searchRegex }
            ]
        })
            .select('username fullName profileImage bio')
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                users: users.map(u => u.toPublicJSON()),
                count: users.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Generate OTP
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash and set to resetPasswordToken
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 mins)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You requested a password reset for your WearVirtually account.</p>
                <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                    <h1 style="color: #000; letter-spacing: 5px; margin: 10px 0;">${resetToken}</h1>
                    <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
                </div>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'WearVirtually Password Reset Code',
                message
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        
        // Hash OTP to compare
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(otp.toString())
            .digest('hex');

        const user = await User.findOne({
            email,
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid code or code has expired' });
        }

        // Set new password
        user.password = password; 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    uploadAvatar,
    searchUsers,
    forgotPassword,
    resetPassword
};
