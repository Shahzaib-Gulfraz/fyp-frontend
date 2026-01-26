const User = require('../models/User');
const { validationResult } = require('express-validator');
const { createNotification } = require('./notificationController');

/**
 * Friend Controller
 * Handles all friend-related operations including requests, acceptance, removal, and suggestions
 */

// ==================== SEND FRIEND REQUEST ====================
/**
 * @route   POST /api/friends/request/:userId
 * @desc    Send a friend request to another user
 * @access  Private
 */
exports.sendFriendRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Validation: Can't send request to yourself
        if (userId === currentUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot send a friend request to yourself'
            });
        }

        // Find both users
        const [targetUser, currentUser] = await Promise.all([
            User.findById(userId),
            User.findById(currentUserId)
        ]);

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already friends
        if (currentUser.friends.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already friends with this user'
            });
        }

        // Check if request already sent
        const existingRequest = targetUser.friendRequests.find(
            req => req.from.toString() === currentUserId.toString() && req.status === 'pending'
        );

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Friend request already sent'
            });
        }

        // Check if target user already sent you a request (auto-accept scenario)
        const reverseRequest = currentUser.friendRequests.find(
            req => req.from.toString() === userId && req.status === 'pending'
        );

        if (reverseRequest) {
            // Auto-accept: both users wanted to be friends
            await acceptFriendRequestLogic(currentUserId, userId);

            // NOTIFICATION: Friend Request Automatically Accepted
            await createNotification({
                recipient: userId,
                sender: currentUserId,
                type: 'friend_accept',
                text: `${currentUser.fullName} accepted your friend request (Matched).`,
                refId: currentUser._id,
                refModel: 'User'
            });

            return res.status(200).json({
                success: true,
                message: 'Friend request automatically accepted',
                autoAccepted: true
            });
        }

        // Add request to target user's friendRequests
        targetUser.friendRequests.push({
            from: currentUserId,
            status: 'pending',
            createdAt: new Date()
        });

        // Add to current user's sentFriendRequests
        currentUser.sentFriendRequests.push({
            to: userId,
            status: 'pending',
            createdAt: new Date()
        });

        await Promise.all([targetUser.save(), currentUser.save()]);

        // NOTIFICATION: Friend Request Received
        await createNotification({
            recipient: userId,
            sender: currentUserId,
            type: 'friend_request',
            text: `${currentUser.fullName} sent you a friend request.`,
            refId: currentUser._id,
            refModel: 'User'
        });

        res.status(200).json({
            success: true,
            message: 'Friend request sent successfully',
            data: {
                requestId: targetUser.friendRequests[targetUser.friendRequests.length - 1]._id,
                to: targetUser.toPublicJSON()
            }
        });

    } catch (error) {
        console.error('Send Friend Request Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send friend request',
            error: error.message
        });
    }
};

// ==================== ACCEPT FRIEND REQUEST ====================
/**
 * @route   POST /api/friends/accept/:requestId
 * @desc    Accept a friend request
 * @access  Private
 */
exports.acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const currentUserId = req.user._id;

        const currentUser = await User.findById(currentUserId);

        // Find the request
        const request = currentUser.friendRequests.id(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been processed'
            });
        }

        const friendId = request.from;

        // Use helper function
        await acceptFriendRequestLogic(currentUserId, friendId);

        // Update request status
        request.status = 'accepted';
        await currentUser.save();

        // Get friend's updated profile
        const friend = await User.findById(friendId);

        // NOTIFICATION: Friend Request Accepted
        await createNotification({
            recipient: friendId, // The person who sent the request originally
            sender: currentUserId, // Me (who accepted)
            type: 'friend_accept',
            text: `${currentUser.fullName} accepted your friend request.`,
            refId: currentUser._id,
            refModel: 'User'
        });

        res.status(200).json({
            success: true,
            message: 'Friend request accepted',
            data: {
                friend: friend.toPublicJSON()
            }
        });

    } catch (error) {
        console.error('Accept Friend Request Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept friend request',
            error: error.message
        });
    }
};

// ==================== REJECT FRIEND REQUEST ====================
/**
 * @route   POST /api/friends/reject/:requestId
 * @desc    Reject a friend request
 * @access  Private
 */
exports.rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const currentUserId = req.user._id;

        const currentUser = await User.findById(currentUserId);

        // Find the request
        const request = currentUser.friendRequests.id(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been processed'
            });
        }

        const senderId = request.from;

        // Update status to rejected
        request.status = 'rejected';
        await currentUser.save();

        // Update sender's sentFriendRequests
        const sender = await User.findById(senderId);
        const sentRequest = sender.sentFriendRequests.find(
            req => req.to.toString() === currentUserId.toString()
        );
        if (sentRequest) {
            sentRequest.status = 'rejected';
            await sender.save();
        }

        res.status(200).json({
            success: true,
            message: 'Friend request rejected'
        });

    } catch (error) {
        console.error('Reject Friend Request Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject friend request',
            error: error.message
        });
    }
};

// ==================== REMOVE FRIEND ====================
/**
 * @route   DELETE /api/friends/remove/:userId
 * @desc    Remove a friend
 * @access  Private
 */
exports.removeFriend = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const [currentUser, friend] = await Promise.all([
            User.findById(currentUserId),
            User.findById(userId)
        ]);

        if (!friend) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if they are friends
        if (!currentUser.friends.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are not friends with this user'
            });
        }

        // Remove from both users' friends arrays
        currentUser.friends = currentUser.friends.filter(
            id => id.toString() !== userId
        );
        friend.friends = friend.friends.filter(
            id => id.toString() !== currentUserId.toString()
        );

        await Promise.all([currentUser.save(), friend.save()]);

        res.status(200).json({
            success: true,
            message: 'Friend removed successfully'
        });

    } catch (error) {
        console.error('Remove Friend Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove friend',
            error: error.message
        });
    }
};

// ==================== GET FRIENDS LIST ====================
/**
 * @route   GET /api/friends
 * @desc    Get user's friends list
 * @access  Private
 */
exports.getFriends = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { search, page = 1, limit = 20 } = req.query;

        const user = await User.findById(currentUserId)
            .populate({
                path: 'friends',
                select: 'username fullName profileImage bio isOnline lastSeen'
            });

        let friends = user.friends;

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            friends = friends.filter(friend =>
                friend.username.toLowerCase().includes(searchLower) ||
                friend.fullName.toLowerCase().includes(searchLower)
            );
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedFriends = friends.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: {
                friends: paginatedFriends.map(f => f.toPublicJSON()),
                total: friends.length,
                page: parseInt(page),
                totalPages: Math.ceil(friends.length / limit)
            }
        });

    } catch (error) {
        console.error('Get Friends Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch friends',
            error: error.message
        });
    }
};

// ==================== GET PENDING REQUESTS ====================
/**
 * @route   GET /api/friends/requests/pending
 * @desc    Get pending friend requests received
 * @access  Private
 */
exports.getPendingRequests = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const user = await User.findById(currentUserId)
            .populate({
                path: 'friendRequests.from',
                select: 'username fullName profileImage bio'
            });

        const pendingRequests = user.friendRequests
            .filter(req => req.status === 'pending')
            .map(req => ({
                requestId: req._id,
                from: req.from.toPublicJSON(),
                createdAt: req.createdAt
            }));

        res.status(200).json({
            success: true,
            data: {
                requests: pendingRequests,
                count: pendingRequests.length
            }
        });

    } catch (error) {
        console.error('Get Pending Requests Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending requests',
            error: error.message
        });
    }
};

// ==================== GET SENT REQUESTS ====================
/**
 * @route   GET /api/friends/requests/sent
 * @desc    Get sent friend requests
 * @access  Private
 */
exports.getSentRequests = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const user = await User.findById(currentUserId)
            .populate({
                path: 'sentFriendRequests.to',
                select: 'username fullName profileImage bio'
            });

        const sentRequests = user.sentFriendRequests
            .filter(req => req.status === 'pending')
            .map(req => ({
                requestId: req._id,
                to: req.to.toPublicJSON(),
                createdAt: req.createdAt
            }));

        res.status(200).json({
            success: true,
            data: {
                requests: sentRequests,
                count: sentRequests.length
            }
        });

    } catch (error) {
        console.error('Get Sent Requests Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sent requests',
            error: error.message
        });
    }
};

// ==================== GET FRIEND SUGGESTIONS ====================
/**
 * @route   GET /api/friends/suggestions
 * @desc    Get friend suggestions based on mutual friends and interests
 * @access  Private
 */
exports.getFriendSuggestions = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { limit = 10, search } = req.query;

        const currentUser = await User.findById(currentUserId);

        // Get IDs to exclude (current user, existing friends, pending requests)
        const excludeIds = [
            currentUserId,
            ...(currentUser.friends || []),
            ...(currentUser.friendRequests || []).map(req => req.from),
            ...(currentUser.sentFriendRequests || []).map(req => req.to)
        ];

        // Build match conditions
        const matchConditions = {
            _id: { $nin: excludeIds },
            isActive: true,
            role: 'user'
        };

        // Add search filter if provided
        if (search) {
            matchConditions.$or = [
                { username: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } }
            ];
        }

        // Debug logging
        console.log('Friend Suggestions Search:', {
            currentUser: currentUser.username,
            currentUserId: currentUserId.toString(),
            searchQuery: search,
            excludedCount: excludeIds.length,
            excludedIds: excludeIds.map(id => id.toString()),
            matchConditions
        });

        // Test the search pattern manually
        if (search) {
            const testUser = await User.findOne({ username: 'maazyounas' });
            if (testUser) {
                console.log('Test user maazyounas:', {
                    id: testUser._id.toString(),
                    username: testUser.username,
                    role: testUser.role,
                    isActive: testUser.isActive,
                    isExcluded: excludeIds.some(id => id.toString() === testUser._id.toString()),
                    matchesUsername: new RegExp(search, 'i').test(testUser.username),
                    matchesFullName: new RegExp(search, 'i').test(testUser.fullName)
                });
            }
        }

        // Find users with mutual friends
        const suggestions = await User.aggregate([
            {
                $match: matchConditions
            },
            {
                $addFields: {
                    // Handle null friends array with $ifNull
                    friendsArray: { $ifNull: ['$friends', []] },
                    currentUserFriends: currentUser.friends || []
                }
            },
            {
                $addFields: {
                    mutualFriendsCount: {
                        $size: {
                            $setIntersection: ['$friendsArray', currentUser.friends || []]
                        }
                    }
                }
            },
            {
                $sort: { mutualFriendsCount: -1, createdAt: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $project: {
                    username: 1,
                    fullName: 1,
                    profileImage: 1,
                    bio: 1,
                    mutualFriendsCount: 1,
                    friendsCount: { $size: { $ifNull: ['$friends', []] } }
                }
            }
        ]);

        console.log('Suggestions found:', suggestions.length, suggestions.map(s => s.username));

        res.status(200).json({
            success: true,
            data: {
                suggestions,
                count: suggestions.length
            }
        });

    } catch (error) {
        console.error('Get Friend Suggestions Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch friend suggestions',
            error: error.message
        });
    }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Helper function to accept friend request logic
 * Adds both users to each other's friends list
 */
async function acceptFriendRequestLogic(userId1, userId2) {
    const [user1, user2] = await Promise.all([
        User.findById(userId1),
        User.findById(userId2)
    ]);

    // Add to friends arrays
    if (!user1.friends.includes(userId2)) {
        user1.friends.push(userId2);
    }
    if (!user2.friends.includes(userId1)) {
        user2.friends.push(userId1);
    }

    // Update sent request status
    const sentRequest = user2.sentFriendRequests.find(
        req => req.to.toString() === userId1.toString()
    );
    if (sentRequest) {
        sentRequest.status = 'accepted';
    }

    await Promise.all([user1.save(), user2.save()]);
}
