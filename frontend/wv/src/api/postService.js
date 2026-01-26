import api from './config';

/**
 * Post Service
 * Handles all post-related API calls
 */
const postService = {
    /**
     * Create a new post
     * @param {object} postData - { image, caption, visibility, tags, tryOnId, productId }
     */
    createPost: async (postData) => {
        try {
            const response = await api.post('/posts', postData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get social feed
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     */
    getFeed: async (page = 1, limit = 10) => {
        try {
            const response = await api.get('/posts/feed', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user posts
     * @param {string} userId - Target user ID
     */
    getUserPosts: async (userId) => {
        try {
            const response = await api.get(`/posts/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get single post
     * @param {string} postId - Post ID
     */
    getPost: async (postId) => {
        try {
            const response = await api.get(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete a post
     * @param {string} postId - Post ID
     */
    deletePost: async (postId) => {
        try {
            const response = await api.delete(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Like/Unlike a post
     * @param {string} postId - Post ID
     */
    likePost: async (postId) => {
        try {
            const response = await api.post(`/posts/${postId}/like`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Add a comment
     * @param {string} postId - Post ID
     * @param {string} text - Comment text
     */
    commentPost: async (postId, text) => {
        try {
            const response = await api.post(`/posts/${postId}/comment`, { text });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default postService;
