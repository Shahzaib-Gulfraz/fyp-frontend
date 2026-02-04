import api from './config';

/**
 * Shop Chat Service
 * Handles shop conversation and messaging API calls
 */
const shopChatService = {
    /**
     * Get or create conversation with shop
     * @param {string} shopId - Shop ID
     */
    getOrCreateConversation: async (shopId) => {
        try {
            const response = await api.get(`/chat/shop/${shopId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Send message to shop
     * @param {string} shopId - Shop ID
     * @param {string} text - Message text
     * @param {string} productId - Optional product ID to mention
     */
    sendMessage: async (shopId, text, productId = null) => {
        try {
            const payload = { text };
            
            // Only include productMentionId if it's provided and truthy
            if (productId) {
                payload.productMentionId = productId;
                console.log('[shopChatService] Sending with product:', productId);
            } else {
                console.log('[shopChatService] Sending without product reference');
            }
            
            console.log('[shopChatService] Final payload:', JSON.stringify(payload));
            const response = await api.post(`/chat/shop/${shopId}/message`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get shop products for product picker
     * @param {string} shopId - Shop ID
     * @param {string} search - Search query
     */
    getShopProducts: async (shopId, search = '') => {
        try {
            const response = await api.get(`/chat/shop/${shopId}/products`, {
                params: { search, limit: 20 }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Mark conversation as read
     * @param {string} conversationId - Conversation ID
     */
    markAsRead: async (conversationId) => {
        try {
            const response = await api.post('/chat/mark-read', { conversationId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get messages for conversation with pagination
     * @param {string} conversationId - Conversation ID
     * @param {number} page - Page number
     * @param {number} limit - Messages per page
     */
    getMessages: async (conversationId, page = 1, limit = 50) => {
        try {
            const response = await api.get(`/chat/messages/${conversationId}`, {
                params: { page, limit }
            });
            return response.data.data || response.data; // Backend sends { success, data: {...} }
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get All Conversations for a Shop (Seller Dashboard)
     * @param {string} shopId - Shop ID
     */
    getAllInquiries: async (shopId) => {
        try {
            const response = await api.get(`/chat/shop/${shopId}/conversations`);
            return response.data.data; // Backend sends { success, data: { conversations } }
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Reply to Inquiry (Seller Dashboard)
     * @param {string} conversationId - Conversation ID
     * @param {string} text - Message text
     */
    replyToInquiry: async (conversationId, text) => {
        try {
            const response = await api.post(`/chat/shop/${conversationId}/reply`, { text });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default shopChatService;
