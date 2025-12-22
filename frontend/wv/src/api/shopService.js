import api from './config';

/**
 * Shop Service
 */
const shopService = {
    /**
     * Get all shops
     */
    getShops: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.city) params.append('city', filters.city);
            if (filters.search) params.append('search', filters.search);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await api.get(`/shops?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get single shop by ID
     */
    getShop: async (shopId) => {
        try {
            const response = await api.get(`/shops/${shopId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get shop products
     */
    getShopProducts: async (shopId) => {
        try {
            const response = await api.get(`/shops/${shopId}/products`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create new shop
     */
    createShop: async (shopData, images) => {
        try {
            const formData = new FormData();

            // Add shop data
            Object.keys(shopData).forEach(key => {
                if (shopData[key] !== null && shopData[key] !== undefined) {
                    formData.append(key, shopData[key]);
                }
            });

            // Add logo
            if (images.logo) {
                formData.append('logo', {
                    uri: images.logo,
                    type: 'image/jpeg',
                    name: 'logo.jpg',
                });
            }

            // Add banner
            if (images.banner) {
                formData.append('banner', {
                    uri: images.banner,
                    type: 'image/jpeg',
                    name: 'banner.jpg',
                });
            }

            const response = await api.post('/shops', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get my shop (for shop owners)
     */
    getMyShop: async () => {
        try {
            const response = await api.get('/shops/my/shop');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update shop
     */
    updateShop: async (shopId, shopData) => {
        try {
            const response = await api.put(`/shops/${shopId}`, shopData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default shopService;
