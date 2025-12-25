const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
        const user = await User.findById(req.user._id).populate('shopId');
        console.log(user);
        res.json({ user: user.toPublicJSON() });
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
        console.log("/updateProfile")
        const { fullName, phone, username, bio, location } = req.body;

        const user = await User.findById(req.user._id);

        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
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

        res.json({
            message: 'Profile updated successfully',
            user: user.toPublicJSON()
        });
    } catch (error) {
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

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    uploadAvatar
};
