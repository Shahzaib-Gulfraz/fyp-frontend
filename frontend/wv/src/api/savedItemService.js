import api from './config';

/**
 * Saved Items Service
 */
const savedItemService = {
    /**
     * Get all saved items
     */
    getSavedItems: async () => {
        try {
            const response = await api.get('/saved-items');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Add item to saved
     */
    addSavedItem: async (productId, variantId = null) => {
        try {
            const response = await api.post('/saved-items', {
                productId,
                variantId,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Remove item from saved
     */
    removeSavedItem: async (savedItemId) => {
        try {
            const response = await api.delete(`/saved-items/${savedItemId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Check if product is saved
     */
    checkSaved: async (productId) => {
        try {
            const response = await api.get(`/saved-items/check/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default savedItemService;
