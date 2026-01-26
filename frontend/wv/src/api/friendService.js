import api from './config';

/**
 * Friend Service
 * Handles all friend-related API calls
 */

const friendService = {
    /**
     * Send a friend request to a user
     * @param {string} userId - Target user ID
     */
    sendFriendRequest: async (userId) => {
        try {
            const response = await api.post(`/friends/request/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Accept a friend request
     * @param {string} requestId - Friend request ID
     */
    acceptFriendRequest: async (requestId) => {
        try {
            const response = await api.post(`/friends/accept/${requestId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Reject a friend request
     * @param {string} requestId - Friend request ID
     */
    rejectFriendRequest: async (requestId) => {
        try {
            const response = await api.post(`/friends/reject/${requestId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Remove a friend
     * @param {string} userId - Friend's user ID
     */
    removeFriend: async (userId) => {
        try {
            const response = await api.delete(`/friends/remove/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get friends list
     * @param {object} params - Query parameters (search, page, limit)
     */
    getFriends: async (params = {}) => {
        try {
            const response = await api.get('/friends', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get pending friend requests (received)
     */
    getPendingRequests: async () => {
        try {
            const response = await api.get('/friends/requests/pending');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get sent friend requests
     */
    getSentRequests: async () => {
        try {
            const response = await api.get('/friends/requests/sent');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get friend suggestions
     * @param {object} params - Query parameters (search, limit)
     */
    getFriendSuggestions: async (params = {}) => {
        try {
            const response = await api.get('/friends/suggestions', {
                params: { limit: 10, ...params }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Search users (for finding new friends)
     * @param {string} query - Search query
     */
    searchUsers: async (query) => {
        try {
            const response = await api.get('/auth/users/search', {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default friendService;
