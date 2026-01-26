const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

/**
 * Post Controller
 * Handles post creation, feed retrieval, and interactions
 */

// ==================== CREATE POST ====================
exports.createPost = async (req, res) => {
    try {
        const { image, caption, productId, tryOnId, visibility, tags } = req.body;
        const userId = req.user._id;

        const post = new Post({
            userId,
            image,
            caption,
            productId,
            tryOnId,
            visibility,
            tags
        });

        await post.save();

        // Populate user details for immediate display
        await post.populate('userId', 'username fullName profileImage');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: { post }
        });
    } catch (error) {
        console.error('Create Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post',
            error: error.message
        });
    }
};

// ==================== GET FEED ====================
exports.getFeed = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        // Get current user's friends
        const currentUser = await User.findById(currentUserId);
        const friendIds = currentUser.friends || [];

        // Build query: 
        // 1. My posts
        // 2. Friends' posts that are NOT private
        // 3. Public posts (optional, keeping it tailored for now)

        const query = {
            $or: [
                { userId: currentUserId }, // My posts
                {
                    userId: { $in: friendIds },
                    visibility: { $in: ['public', 'friends'] }
                }
            ]
        };

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('userId', 'username fullName profileImage')
            .populate('productId', 'name price thumbnail')
            .populate('likes', 'username fullName profileImage') // Populated for display
            .populate('comments.userId', 'username fullName profileImage');

        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                posts,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    count: total
                }
            }
        });
    } catch (error) {
        console.error('Get Feed Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feed',
            error: error.message
        });
    }
};

// ==================== GET SINGLE POST ====================
exports.getPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const currentUserId = req.user._id;

        const post = await Post.findById(postId)
            .populate('userId', 'username fullName profileImage')
            .populate('productId', 'name price thumbnail')
            .populate('likes', 'username fullName profileImage')
            .populate('comments.userId', 'username fullName profileImage');

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check visibility
        if (post.visibility === 'private' && post.userId._id.toString() !== currentUserId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to private post' });
        }

        // If friends only, check friendship
        if (post.visibility === 'friends' && post.userId._id.toString() !== currentUserId.toString()) {
            const currentUser = await User.findById(currentUserId);
            if (!currentUser.friends.includes(post.userId._id)) {
                return res.status(403).json({ success: false, message: 'This post is visible to friends only' });
            }
        }

        res.status(200).json({
            success: true,
            data: { post }
        });
    } catch (error) {
        console.error('Get Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch post',
            error: error.message
        });
    }
};

// ==================== LIKE POST ====================
exports.likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(userId);
        const isLiked = likeIndex > -1;

        if (isLiked) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(userId);

            // NOTIFICATION: Post Liked (Only if liker != owner)
            if (post.userId.toString() !== userId.toString()) {
                const liker = await User.findById(userId);
                await createNotification({
                    recipient: post.userId,
                    sender: userId,
                    type: 'like',
                    text: `${liker.fullName} liked your post.`,
                    refId: post._id,
                    refModel: 'Post'
                });
            }
        }

        await post.save();

        res.status(200).json({
            success: true,
            isLiked: !isLiked,
            likesCount: post.likes.length
        });
    } catch (error) {
        console.error('Like Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle like',
            error: error.message
        });
    }
};

// ==================== COMMENT POST ====================
exports.commentPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const newComment = {
            userId,
            text,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // NOTIFICATION: New Comment
        if (post.userId.toString() !== userId.toString()) {
            const commenter = await User.findById(userId);
            await createNotification({
                recipient: post.userId,
                sender: userId,
                type: 'comment',
                text: `${commenter.fullName} commented on your post: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
                refId: post._id,
                refModel: 'Post'
            });
        }

        // Populate the new comment user info for return
        await post.populate('comments.userId', 'username fullName profileImage');
        const addedComment = post.comments[post.comments.length - 1];

        res.status(201).json({
            success: true,
            message: 'Comment added',
            data: { comment: addedComment }
        });
    } catch (error) {
        console.error('Comment Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message
        });
    }
};

// ==================== GET USER POSTS ====================
exports.getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Determine relationship to check visibility access
        // If viewing own profile: show all
        // If friend: show public + friends
        // If stranger: show public only

        let visibilityFilter = ['public'];

        if (userId === currentUserId.toString()) {
            visibilityFilter = ['public', 'friends', 'private'];
        } else {
            const currentUser = await User.findById(currentUserId);
            if (currentUser.friends.includes(userId)) {
                visibilityFilter = ['public', 'friends'];
            }
        }

        const posts = await Post.find({
            userId,
            visibility: { $in: visibilityFilter }
        })
            .sort({ createdAt: -1 })
            .populate('userId', 'username fullName profileImage')
            .populate('productId', 'name price thumbnail');

        res.status(200).json({
            success: true,
            data: { posts }
        });
    } catch (error) {
        console.error('Get User Posts Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user posts',
            error: error.message
        });
    }
};

// ==================== DELETE POST ====================
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findOne({ _id: postId, userId }); // Ensure ownership
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post',
            error: error.message
        });
    }
};
