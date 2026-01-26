import api from './config';

const tryOnService = {
    /**
     * Generate a Virtual Try-On
     * @param {Object} data - { garment_img, human_img, garmentId }
     */
    generateTryOn: async (data) => {
        try {
            const response = await api.post('/try-on/generate', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get Try-On History
     */
    getHistory: async () => {
        try {
            const response = await api.get('/try-on/history');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Upload image to Cloudinary (using existing upload endpoint or new one)
     * Assuming we re-use auth/upload-avatar or create a general upload
     * For now, we will use the existing product upload or create a utility function.
     * If a dedicated upload endpoint isn't available, we might need one.
     * However, we can use the `productService.uploadImage` if it exists.
     */
    uploadImage: async (formData) => {
        // Re-using the product upload endpoint for convenience, or auth upload
        // Let's assume we can use a generic upload route if exists, else we create one.
        // Checking backend... productController has uploadImage.
        // We'll try to use /api/products/upload-image if available.
        try {
            const response = await api.post('/products/upload-image', formData, {
                transformRequest: (data, headers) => {
                    return data; // Prevent axios from serializing formData
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default tryOnService;
